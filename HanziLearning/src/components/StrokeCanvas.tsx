import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, AccessibilityInfo, findNodeHandle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import useStrokeCanvas from '../hooks/useStrokeCanvas';

interface StrokeCanvasProps {
  currentStroke: string;
  strokeIcon: string;
  strokeDesc: string;
  onCorrectStroke?: (isCorrect: boolean) => void;
}

/**
 * 笔画绘制画布组件
 */
const StrokeCanvas: React.FC<StrokeCanvasProps> = ({ 
  currentStroke, 
  strokeIcon,
  strokeDesc,
  onCorrectStroke
}) => {
  const canvasRef = useRef<View>(null);
  
  // 使用自定义Hook处理绘制逻辑
  const { 
    points, 
    feedback, 
    pathData, 
    responderHandlers,
    clearCanvas 
  } = useStrokeCanvas(currentStroke, {
    onStrokeEnd: (isCorrect) => {
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
    }
  });
  
  // 测量画布大小
  useEffect(() => {
    if (canvasRef.current) {
      // 确保在组件挂载后测量画布大小
      setTimeout(() => {
        canvasRef.current?.measure((x, y, width, height, pageX, pageY) => {
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

  // 页面加载时提供整体使用引导并自动设置焦点到绘图区域
  useEffect(() => {
    if (isTalkBackEnabled) {
      const introMessage = 
        "欢迎使用笔画学习功能。" +
        "绘制区域是一个占据屏幕大部分的矩形区域。它位于屏幕中央，左右两侧各距离屏幕边缘约一厘米，上下延伸占据了屏幕高度的三分之二。绘制笔画时您能感受到轻微的震动，这就说明您在区域内绘制笔画了。" +
        "听到语音指示后，使用双指在屏幕上绘制笔画。" +
        "画完后抬起双指，系统会判断笔画是否正确。";
      
      // 延迟一秒播放引导信息，确保在页面完全加载后
      setTimeout(() => {
        AccessibilityInfo.announceForAccessibility(introMessage);
      }, 1000);
    }
    
    // 组件挂载后自动将焦点设置到绘图区域
    setTimeout(() => {
      if (canvasRef.current) {
        const reactTag = findNodeHandle(canvasRef.current);
        if (reactTag) {
          AccessibilityInfo.setAccessibilityFocus(reactTag);
        }
      }
    }, 500);
  }, [isTalkBackEnabled]);

  // 当前笔画变更时提供详细描述
  useEffect(() => {
    if (isTalkBackEnabled) {
      const strokeDetailMessage = 
        `当前要练习的笔画是${currentStroke}。${getStrokeGuidance(currentStroke)}; 双击绘制区域可获取详细指导`;
      
      // 延迟播放详细描述，避免与页面加载提示冲突
      setTimeout(() => {
        AccessibilityInfo.announceForAccessibility(strokeDetailMessage);
      }, 3000);
    }
  }, [currentStroke, isTalkBackEnabled]);

  // 根据笔画类型提供详细的绘制引导
  const getStrokeGuidance = (strokeType: string): string => {
    switch(strokeType) {
      case "横":
        return "横是从左向右画一条水平直线。请确保线条水平且长度适当。";
      case "竖":
        return "竖是从上向下画一条垂直直线。请确保线条垂直且长度适当。";
      case "撇":
        return "撇是从右上方向左下方画一条斜线。请确保方向正确。";
      case "捺":
        return "捺是从左上方向右下方画一条斜线。请确保斜线方向和角度合适。";
      case "点":
        return "点是轻点用力按下形成短促有力的一点。注意不要画得太长。";
      case "折":
        return "折是先从左向右画一横，然后垂直向下画一竖，最后向右上方画一个短勾。注意要有两个明显的转折。";
      default:
        return strokeDesc;
    }
  };

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
      <View 
        ref={canvasRef}
        style={styles.canvas}
        accessible={true}
        accessibilityLabel={"笔画练习区域"}
        accessibilityHint="在此绘制笔画"
        accessibilityRole="none"
        accessibilityActions={[
          {name: 'activate', label: '获取笔画详细指导'},
          {name: 'longpress', label: '清除笔画'}
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
            {opacity: points.length > 1 ? 0.05 : 0.2}
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
            {color: feedback.includes("很好") ? "green" : "red"}
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