import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, AccessibilityInfo, findNodeHandle, Vibration, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Sound from 'react-native-sound';
import useStrokeCanvas from '../hooks/useStrokeCanvas';

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
  const isFirstLoadRef = useRef(true);

  // 初始化音频文件
  const successSound = useRef<Sound | null>(null);
  const errorSound = useRef<Sound | null>(null);

  useEffect(() => {
    // 设置音频
    Sound.setCategory('Playback');
    
    // 加载成功音效
    successSound.current = new Sound('success_fanfare_trumpets_6185.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load success sound', error);
      } else {
        console.log('Success sound loaded successfully');
      }
    });

    // 加载失败音效
    errorSound.current = new Sound('failed_295059.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load error sound', error);
      } else {
        console.log('Error sound loaded successfully');
      }
    });

    return () => {
      // 清理音频资源
      if (successSound.current) {
        successSound.current.release();
      }
      if (errorSound.current) {
        errorSound.current.release();
      }
    };
  }, []); // 追踪是否首次加载

  // 音效播放函数
  const playSuccessSound = useCallback(() => {
    try {
      console.log('Playing success sound/vibration');
      
      // 播放音效
      if (successSound.current) {
        successSound.current.play((success) => {
          if (!success) {
            console.log('Failed to play success sound');
          }
        });
      }
      
      // 配合震动反馈
      if (enableHapticFeedback) {
        Vibration.vibrate(200);
      }
    } catch (error) {
      console.warn('Failed to play success feedback:', error);
    }
  }, [enableHapticFeedback]);

  const playErrorSound = useCallback(() => {
    try {
      console.log('Playing error sound/vibration');
      
      // 播放音效
      if (errorSound.current) {
        errorSound.current.play((success) => {
          if (!success) {
            console.log('Failed to play error sound');
          }
        });
      }
      
      // 配合震动反馈
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
      
      // 立即播放音效反馈
      if (isCorrect) {
        playSuccessSound();
      } else {
        playErrorSound();
      }
      
      // 如果笔画识别正确，清空笔画轨迹
      if (isCorrect) {
        clearCanvas();
      }
      
      // TalkBack模式下朗读详细的反馈结果
      if (isTalkBackEnabled) {
        const resultMessage = isCorrect
          ? `很好，您的${currentStroke}笔画书写正确，即将进入下一个笔画。`
          : `${feedback}。请再次尝试书写${currentStroke}，${getStrokeGuidance(currentStroke)}`;
        
        // 先播放反馈
        AccessibilityInfo.announceForAccessibility(resultMessage);
        
        // 如果笔画正确，等待反馈读完再通知父组件
        if (isCorrect) {
          // 估算语音播报时间，一般每个字需要0.2秒
          const messageLength = resultMessage.length;
          const estimatedTime = Math.max(messageLength * 200, 2000); // 至少2秒
          
          setTimeout(() => {
            // 延迟通知父组件，确保语音反馈已完成
            onCorrectStroke?.(isCorrect);
          }, estimatedTime);
        } else {
          // 如果笔画不正确，直接通知父组件
          onCorrectStroke?.(isCorrect);
        }
      } else {
        // 非TalkBack模式，直接通知父组件
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
      });
    };
    
    checkScreenReader();
    
    // 监听屏幕阅读器状态变化
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      checkScreenReader
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

  // 页面加载时播放无障碍引导信息（只在首次加载时播报详细信息）
  useEffect(() => {
    if (isTalkBackEnabled && isFirstLoadRef.current) {
      // 标记已经播报过首次引导
      isFirstLoadRef.current = false;
      
      // 1. 先说明双指绘制避免手势冲突
      const message1 = '为了避免和无障碍手势冲突，需要双指在笔画绘制区域绘制笔画。';
      
      // 2. 描述绘制区域位置
      const message2 = '绘制区域是一个占据屏幕大部分的矩形区域。它位于屏幕中央，左右两侧各距离屏幕边缘约一厘米，上下延伸占据了屏幕高度的三分之二。绘制笔画时您能感受到轻微的震动。';
      
      // 3. 说明操作方式
      const message3 = '点按两次即可获取笔画详细指导，点按两次并按住即可清除笔画。';
      
      // 4. 操作流程说明
      const message4 = '听到语音指示后，使用双指在屏幕上绘制笔画，画完后抬起双指，系统会判断笔画是否正确。';
      
      // 按顺序播放语音，每条消息间隔3秒
      setTimeout(() => {
        AccessibilityInfo.announceForAccessibility(message1);
      }, 1000);
      
      setTimeout(() => {
        AccessibilityInfo.announceForAccessibility(message2);
      }, 4000);
      
      setTimeout(() => {
        AccessibilityInfo.announceForAccessibility(message3);
      }, 7000);
      
      setTimeout(() => {
        AccessibilityInfo.announceForAccessibility(message4);
      }, 10000);
      
      // 组件挂载后自动将焦点设置到绘图区域
      setTimeout(() => {
        if (canvasRef.current) {
          const reactTag = findNodeHandle(canvasRef.current);
          if (reactTag) {
            AccessibilityInfo.setAccessibilityFocus(reactTag);
          }
        }
      }, 11000); // 在所有引导播报完成后设置焦点
    }
  }, [isTalkBackEnabled]);

  // 笔画变更时的简单播报（包括首次加载时的当前笔画播报）
  useEffect(() => {
    if (isTalkBackEnabled) {
      const delay = isFirstLoadRef.current ? 13000 : 500; // 首次加载延迟更长，笔画切换延迟较短
      
      setTimeout(() => {
        const message = `当前要练习的笔画是${currentStroke}。${getStrokeGuidance(currentStroke)}`;
        AccessibilityInfo.announceForAccessibility(message);
      }, delay);
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
      {/* 临时测试按钮 */}
      <View style={{position: 'absolute', top: 10, right: 10, zIndex: 1000, flexDirection: 'row'}}>
        <TouchableOpacity 
          onPress={playSuccessSound}
          style={{backgroundColor: 'green', padding: 8, marginRight: 5, borderRadius: 4}}
        >
          <Text style={{color: 'white', fontSize: 12}}>测试成功</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={playErrorSound}
          style={{backgroundColor: 'red', padding: 8, borderRadius: 4}}
        >
          <Text style={{color: 'white', fontSize: 12}}>测试失败</Text>
        </TouchableOpacity>
      </View>

      <View
        ref={canvasRef}
        style={styles.canvas}
        accessible={true}
        accessibilityLabel={'笔画练习区域'}
        accessibilityHint="在此绘制笔画"
        accessibilityRole="none"
        accessibilityActions={[
          {name: 'activate', label: '获取笔画详细指导'},
          {name: 'longpress', label: '清除笔画'},
        ]}
        onAccessibilityAction={(event) => {
          switch (event.nativeEvent.actionName) {
            case 'activate':
              handleAccessibilityActivation();
              break;
            case 'longpress':
              clearCanvas();
              AccessibilityInfo.announceForAccessibility('笔画已清除，请重新书写');
              break;
          }
        }}
        accessibilityLiveRegion="polite"
        importantForAccessibility="yes"
        {...responderHandlers}
      >
        {/* 绘制区域，确保SVG覆盖整个区域并且位置计算正确 */}
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

        {/* 当前笔画提示 */}
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

        {/* 反馈信息 */}
        <Text
          style={[
            styles.feedback,
            feedback.includes('很好') ? styles.successFeedback : styles.errorFeedback,
          ]}
          accessible={true}
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
});

export default StrokeCanvas;
