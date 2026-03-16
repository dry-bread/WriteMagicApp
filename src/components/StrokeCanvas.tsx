import React, { useRef, useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, AccessibilityInfo, findNodeHandle, Vibration, Platform, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import useStrokeCanvas from '../hooks/useStrokeCanvas';
import SoundHelper from '../utils/soundHelper';
import { enableDirectTouch, disableDirectTouch } from './DirectTouchView';

interface StrokeCanvasProps {
  currentStroke: string;
  strokeIcon: string;
  strokeDesc: string;
  onCorrectStroke?: (isCorrect: boolean) => void;
  enableHapticFeedback?: boolean;
}

/**
 * 笔画绘制画布组件
 */
const StrokeCanvas: React.FC<StrokeCanvasProps> = ({
  currentStroke,
  strokeIcon,
  strokeDesc,
  onCorrectStroke,
  enableHapticFeedback = true,
}) => {
  const canvasRef = useRef<View>(null);
  const drawingModeButtonRef = useRef<View>(null);
  const isFirstLoadRef = useRef(true);
  
  // 绘制模式状态 - 用于VoiceOver用户切换到直接触摸模式
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const drawingModeTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 使用ref来追踪TalkBack状态，避免闭包问题
  const isTalkBackEnabledRef = useRef(false);

  // 震动和音效反馈函数
  const playSuccessVibration = useCallback(() => {
    try {
      console.log('Playing success feedback');
      // 播放成功音效
      SoundHelper.playSuccess();
      // 震动反馈
      if (enableHapticFeedback) {
        Vibration.vibrate(200);
      }
    } catch (error) {
      console.warn('Failed to play success feedback:', error);
    }
  }, [enableHapticFeedback]);

  const playErrorVibration = useCallback(() => {
    try {
      console.log('Playing error feedback');
      // 播放错误音效
      SoundHelper.playError();
      // 震动反馈
      if (enableHapticFeedback) {
        Vibration.vibrate(500);
      }
    } catch (error) {
      console.warn('Failed to play error feedback:', error);
    }
  }, [enableHapticFeedback]);
  
  // 使用自定义Hook处理绘制逻辑
  const {
    points,
    feedback,
    pathData,
    responderHandlers,
    clearCanvas,
  } = useStrokeCanvas(currentStroke, {
    enableHapticFeedback,
    onStrokeEnd: (isCorrect) => {
      console.log('Stroke ended, isCorrect:', isCorrect);
      
      // 立即播放震动反馈
      if (isCorrect) {
        playSuccessVibration();
      } else {
        playErrorVibration();
      }
      
      // 如果笔画识别正确，清空笔画轨迹
      if (isCorrect) {
        clearCanvas();
      }
      
      // 使用ref来检查TalkBack状态，避免闭包问题
      const isTalkBackOn = isTalkBackEnabledRef.current;
      console.log('TalkBack enabled (from ref):', isTalkBackOn);
      
      // 无论是否开启TalkBack，都播报结果（因为在绘制模式下用户需要知道结果）
      const resultMessage = isCorrect
        ? `书写正确！您的${currentStroke}笔画很标准。即将进入下一个笔画。`
        : `书写不正确。${feedback || '请再试一次'}。请继续书写${currentStroke}。`;
      
      console.log('Announcing result:', resultMessage);
      
      // 播放语音反馈
      AccessibilityInfo.announceForAccessibility(resultMessage);
      
      // 如果笔画正确，等待反馈读完再通知父组件
      if (isCorrect) {
        // 估算语音播报时间
        const estimatedTime = Math.max(resultMessage.length * 150, 2500);
        
        setTimeout(() => {
          // 延迟通知父组件，确保语音反馈已完成
          onCorrectStroke?.(isCorrect);
        }, estimatedTime);
      } else {
        // 如果笔画不正确，直接通知父组件
        onCorrectStroke?.(isCorrect);
      }
    },
  });
  
  // 测量画布大小
  useEffect(() => {
    if (canvasRef.current) {
      // 确保在组件挂载后测量画布大小
      setTimeout(() => {
        canvasRef.current?.measure((_x, _y, _width, _height, _pageX, _pageY) => {
          // 画布测量信息可以在需要时用到
        });
      }, 300);
    }
  }, []);

  // 检测设备是否开启了TalkBack
  const [isTalkBackEnabled, setIsTalkBackEnabled] = React.useState(false);
  
  useEffect(() => {
    // 检查TalkBack是否启用
    const checkScreenReader = () => {
      AccessibilityInfo.isScreenReaderEnabled().then(enabled => {
        setIsTalkBackEnabled(enabled);
        isTalkBackEnabledRef.current = enabled;
      });
    };
    
    checkScreenReader();
    
    // 监听屏幕阅读器状态变化
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (enabled) => {
        setIsTalkBackEnabled(enabled);
        isTalkBackEnabledRef.current = enabled;
      }
    );
    
    return () => {
      subscription.remove();
    };
  }, []);

  // 根据笔画类型提供详细的绘制引导
  const getStrokeGuidance = useCallback((strokeType: string): string => {
    switch(strokeType) {
      case '横':
        return '横是从左向右画一条水平直线。请确保线条水平且长度适当。';
      case '竖':
        return '竖是从上向下画一条垂直直线。请确保线条垂直且长度适当。';
      case '撇':
        return '撇是从右上方向左下方画一条斜线。请确保方向正确。';
      case '捺':
        return '捺是从左上方向右下方画一条斜线。请确保斜线方向和角度合适。';
      case '点':
        return '点是轻点用力按下形成短促有力的一点。注意不要画得太长。';
      case '折':
        return '折是先从左向右画一横，然后垂直向下画一竖，最后向右上方画一个短勾。注意要有两个明显的转折。';
      default:
        return strokeDesc;
    }
  }, [strokeDesc]);

  // 页面加载时立即设置焦点到绘制模式按钮
  useEffect(() => {
    if (isTalkBackEnabled && isFirstLoadRef.current) {
      // 标记已经播报过首次引导
      isFirstLoadRef.current = false;
      
      // 多次尝试设置焦点，确保按钮已渲染
      const setFocusToButton = () => {
        if (drawingModeButtonRef.current) {
          const reactTag = findNodeHandle(drawingModeButtonRef.current);
          console.log('Setting focus to drawing mode button, reactTag:', reactTag);
          if (reactTag) {
            AccessibilityInfo.setAccessibilityFocus(reactTag);
            return true;
          }
        }
        return false;
      };
      
      // 第一次尝试 - 1秒后
      const timer1 = setTimeout(() => {
        if (!setFocusToButton()) {
          // 第二次尝试 - 1.5秒后
          setTimeout(setFocusToButton, 500);
        }
      }, 1000);
      
      // 播报提示
      const announceTimer = setTimeout(() => {
        AccessibilityInfo.announceForAccessibility(
          `当前笔画是${currentStroke}。双击屏幕进入绘制模式开始书写。`
        );
      }, 2000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(announceTimer);
      };
    }
  }, [isTalkBackEnabled, currentStroke]);
  
  // 进入绘制模式
  const enterDrawingMode = useCallback(() => {
    console.log('=== enterDrawingMode called ===');
    setIsDrawingMode(true);
    
    // 设置 UIAccessibilityTraitAllowsDirectInteraction
    // 延迟一帧确保 React 渲染完成
    setTimeout(() => {
      enableDirectTouch('stroke-canvas');
    }, 100);
    
    // 清除之前的定时器
    if (drawingModeTimerRef.current) {
      clearTimeout(drawingModeTimerRef.current);
    }
    
    // 播放提示音和震动
    SoundHelper.playSuccess();
    Vibration.vibrate(100);
    
    console.log('Announcing: 已进入绘制模式');
    AccessibilityInfo.announceForAccessibility(
      `已进入绘制模式。请用手指书写${currentStroke}笔画。${getStrokeGuidance(currentStroke)}。书写完成后会自动判断结果。如需退出，请用三指单击屏幕。`
    );
    
    // 60秒后自动退出绘制模式（延长时间）
    drawingModeTimerRef.current = setTimeout(() => {
      exitDrawingMode();
    }, 60000);
  }, [currentStroke, getStrokeGuidance]);
  
  // 退出绘制模式
  const exitDrawingMode = useCallback(() => {
    setIsDrawingMode(false);
    
    // 移除 UIAccessibilityTraitAllowsDirectInteraction
    disableDirectTouch('stroke-canvas');
    
    if (drawingModeTimerRef.current) {
      clearTimeout(drawingModeTimerRef.current);
      drawingModeTimerRef.current = null;
    }
    
    Vibration.vibrate([0, 50, 50, 50]);
    AccessibilityInfo.announceForAccessibility('已退出绘制模式，恢复正常导航。双击并按住可重新进入绘制模式。');
  }, []);
  
  // 清理定时器
  useEffect(() => {
    return () => {
      if (drawingModeTimerRef.current) {
        clearTimeout(drawingModeTimerRef.current);
      }
    };
  }, []);

  // 笔画变更时的播报
  useEffect(() => {
    if (isTalkBackEnabled) {
      // 首次加载时，在双指说明后播报笔画信息
      if (isFirstLoadRef.current) {
        setTimeout(() => {
          const message = `当前要练习的笔画是${currentStroke}。${getStrokeGuidance(currentStroke)}`;
          AccessibilityInfo.announceForAccessibility(message);
        }, 6000);
      } else {
        // 切换笔画时，立即播报新笔画信息，但不重新设置焦点
        // 使用更短的延迟确保切换动画完成
        setTimeout(() => {
          const message = `下一个笔画。当前要练习的笔画是${currentStroke}。${getStrokeGuidance(currentStroke)}`;
          AccessibilityInfo.announceForAccessibility(message);
        }, 100);
      }
    }
  }, [currentStroke, isTalkBackEnabled, getStrokeGuidance]);

  // 处理TalkBack模式下的笔画绘制
  const handleAccessibilityActivation = () => {
    if (isTalkBackEnabled) {
      // 在TalkBack模式下，当用户双击激活时告知用户当前操作
      const activationMessage =
        `正在绘制${currentStroke}笔画。${getStrokeGuidance(currentStroke)}${feedback ? '上次反馈：' + feedback : ''}`;

      AccessibilityInfo.announceForAccessibility(activationMessage);
      return true;
    }
    return false;
  };

  return (
    <View style={styles.canvasContainer}>
      {/* VoiceOver 绘制模式控制按钮 */}
      {isTalkBackEnabled && !isDrawingMode && (
        <Pressable
          ref={drawingModeButtonRef}
          style={styles.drawingModeButton}
          accessible={true}
          accessibilityLabel={`进入绘制模式。当前笔画：${currentStroke}。${getStrokeGuidance(currentStroke)}。双击开始书写。`}
          accessibilityHint="双击进入绘制模式"
          accessibilityRole="button"
          onPress={() => {
            console.log('=== Pressable onPress triggered - entering drawing mode ===');
            enterDrawingMode();
          }}
        >
          <Text style={styles.drawingModeButtonText}>
            双击进入绘制模式
          </Text>
          <Text style={styles.strokeHintLarge}>{strokeIcon}</Text>
          <Text style={styles.drawingModeSubText}>
            当前笔画：{currentStroke}
          </Text>
        </Pressable>
      )}
      
      {/* VoiceOver 绘制模式下 - 绘制状态提示和退出按钮 */}
      {isTalkBackEnabled && isDrawingMode && (
        <View 
          style={styles.drawingModeHeader}
          pointerEvents="box-none"
        >
          <Pressable
            style={styles.exitDrawingModeButtonLarge}
            accessible={true}
            accessibilityLabel={`正在绘制${currentStroke}。请在下方区域用手指书写笔画。书写完成后会自动判断结果。双击此按钮可退出绘制模式。`}
            accessibilityHint="双击退出绘制模式"
            accessibilityRole="button"
            onPress={() => {
              console.log('=== Pressable onPress triggered - exiting drawing mode ===');
              exitDrawingMode();
            }}
          >
            <Text style={styles.drawingModeStatusText}>正在绘制：{currentStroke}</Text>
            <Text style={styles.drawingModeHelpText}>请在下方区域用手指书写笔画</Text>
            <Text style={styles.exitButtonTextLarge}>双击此处退出绘制模式</Text>
          </Pressable>
        </View>
      )}
      
      {/* 绘制画布 - 通过原生模块动态设置 AllowsDirectInteraction 特性 */}
      <View
        ref={canvasRef}
        style={styles.canvas}
        testID="stroke-canvas"
        accessible={true}
        accessibilityLabel={
          isDrawingMode
            ? `${currentStroke}笔画绘制区域，请直接书写`
            : `笔画练习区域。当前笔画：${currentStroke}。${getStrokeGuidance(currentStroke)}`
        }
        accessibilityHint={isDrawingMode ? undefined : "双击并按住进入绘制模式"}
        accessibilityRole="none"
        accessibilityActions={isDrawingMode ? undefined : [
          {name: 'activate', label: '获取笔画详细指导'},
          {name: 'longpress', label: '进入绘制模式'},
        ]}
        onAccessibilityAction={(event) => {
          switch (event.nativeEvent.actionName) {
            case 'activate':
              handleAccessibilityActivation();
              break;
            case 'longpress':
              enterDrawingMode();
              break;
          }
        }}
        importantForAccessibility="yes"
        {...responderHandlers}
      >
        <Svg
          style={styles.svgContainer}
          width="100%"
          height="100%"
          accessible={false}
          importantForAccessibility="no-hide-descendants"
        >
          {points.length > 1 && (
            <Path
              d={pathData}
              stroke="black"
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          )}
        </Svg>

        <Text
          style={[
            styles.strokeHint,
            points.length > 1 ? styles.strokeHintDrawing : styles.strokeHintStatic,
          ]}
          accessible={false}
          importantForAccessibility="no"
        >
          {strokeIcon}
        </Text>

        <Text
          style={[
            styles.feedback,
            feedback.includes('很好') ? styles.successFeedback : styles.errorFeedback,
          ]}
          accessible={!isDrawingMode}
          accessibilityLabel={feedback}
          accessibilityLiveRegion="assertive"
        >
          {feedback}
        </Text>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  canvasContainer: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 5,
    marginBottom: 15,
    overflow: 'hidden',
    minHeight: 350,
    position: 'relative',
  },
  canvas: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  strokeHint: {
    fontSize: 100,
    fontWeight: 'bold',
    color: 'rgba(0,0,0,0.2)',
    position: 'absolute',
    textAlign: 'center',
    width: '100%',
    zIndex: 0,
  },
  strokeHintDrawing: {
    opacity: 0.05,
  },
  strokeHintStatic: {
    opacity: 0.2,
  },
  feedback: {
    fontSize: 16,
    color: '#333',
    position: 'absolute',
    bottom: 15,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 5,
    borderRadius: 5,
    textAlign: 'center',
    width: '80%',
    alignSelf: 'center',
  },
  successFeedback: {
    color: 'green',
  },
  errorFeedback: {
    color: 'red',
  },
  bottomTip: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
    position: 'absolute',
    bottom: 20,
    textAlign: 'center',
    width: '100%',
  },
  drawingModeButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: 20,
  },
  drawingModeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    textAlign: 'center',
    marginBottom: 20,
  },
  strokeHintLarge: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  drawingModeSubText: {
    fontSize: 20,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
  },
  drawingModeHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 200,
  },
  exitDrawingModeButtonLarge: {
    backgroundColor: 'rgba(76, 175, 80, 0.95)',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  drawingModeStatusText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  drawingModeHelpText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  exitButtonTextLarge: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  exitDrawingModeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#f44336',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    zIndex: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  exitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default StrokeCanvas;
