import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, AccessibilityInfo } from 'react-native';
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
      // 通知父组件笔画书写结果
      onCorrectStroke?.(isCorrect);
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

  // 处理TalkBack模式下的笔画绘制
  const handleAccessibilityActivation = () => {
    if (isTalkBackEnabled) {
      // 在TalkBack模式下，当用户双击激活时告知用户当前操作
      AccessibilityInfo.announceForAccessibility(
        `正在绘制${strokeDesc}笔画。${feedback ? feedback : ''}`
      );
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
        accessibilityLabel={`笔画练习区域，当前笔画：${strokeDesc}`}
        accessibilityHint="在此区域绘制笔画，双击屏幕开始书写"
        accessibilityRole="none"
        accessibilityActions={[
          {name: 'activate', label: '绘制笔画'},
          {name: 'longpress', label: '清除笔画'}
        ]}
        onAccessibilityAction={(event) => {
          switch (event.nativeEvent.actionName) {
            case 'activate':
              handleAccessibilityActivation();
              break;
            case 'longpress':
              clearCanvas();
              AccessibilityInfo.announceForAccessibility('笔画已清除');
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
        
        {/* 底部提示信息 */}
        <Text 
          style={[
            styles.bottomTip,
            {color: points.length > 1 ? "transparent" : "#e74c3c"}
          ]}
          accessible={true}
          accessibilityLiveRegion="polite"
        >
          {strokeDesc}
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