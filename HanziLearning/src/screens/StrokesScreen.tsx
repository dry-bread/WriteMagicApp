import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Alert,
  GestureResponderEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path } from 'react-native-svg';

// 定义笔画数据
const strokes = [
  { name: "横", icon: "一", desc: "从左到右画一条直线" },
  { name: "竖", icon: "丨", desc: "从上到下画一条直线" },
  { name: "撇", icon: "丿", desc: "从右上向左下画斜线" },
  { name: "捺", icon: "㇏", desc: "从左上向右下画斜线" },
  { name: "点", icon: "丶", desc: "轻点用力按下" },
  { name: "折", icon: "⺄", desc: "转折改变方向" }
];

// 在React Native/TypeScript项目中实现
function checkStroke(points: {x: number, y: number, time: number}[], 
                     expectedStroke: string): {correct: boolean, feedback: string} {
  
  // 至少要有一定数量的点
  if (points.length < 5) {
    return {correct: false, feedback: "笔画太短了，请重试"};
  }
  
  // 提取关键特征
  const startPoint = points[0];
  const endPoint = points[points.length - 1];
  const midPoint = points[Math.floor(points.length / 2)];
  
  // 计算主要方向
  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;
  const distance = Math.sqrt(dx*dx + dy*dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  
  // 检查笔画速度（可选）
  const duration = endPoint.time - startPoint.time; // 毫秒
  const speed = distance / duration;
  
  // 根据不同笔画类型检查
  switch(expectedStroke) {
    case "横":
      if (Math.abs(angle) > 30) {
        return {correct: false, feedback: "横画应该从左到右水平画"};
      }
      if (distance < 30) {
        return {correct: false, feedback: "横画长度不够"};
      }
      return {correct: true, feedback: "很好！横画正确"};
      
    case "竖":
      if (Math.abs(angle - 90) > 30) {
        return {correct: false, feedback: "竖画应该从上到下垂直画"};
      }
      if (distance < 30) {
        return {correct: false, feedback: "竖画长度不够"};
      }
      return {correct: true, feedback: "很好！竖画正确"};
    
    case "撇":
      if (!(angle > 100 && angle < 170)) {
        return {correct: false, feedback: "撇应该从右上向左下画"};
      }
      return {correct: true, feedback: "很好！撇画正确"};
    
    case "捺":
      // 完全重写捺的识别逻辑
      // 捺应该是从左上向右下的斜线
      
      // 打印调试信息，帮助理解角度问题
      console.log("捺笔画诊断:", {
        angle: angle,
        dx: dx,
        dy: dy,
        startPoint: startPoint,
        endPoint: endPoint
      });
      
      // 检查起点是否在左上，终点是否在右下
      const isLeftToRight = dx > 20; // 水平向右移动
      const isTopToBottom = dy > 20; // 垂直向下移动
      
      // 检查基本方向是否正确（左上到右下）
      if (!isLeftToRight || !isTopToBottom) {
        return {correct: false, feedback: "捺应该从左上向右下画斜线"};
      }
      
      // 检查斜率是否合适（不能太平或太陡）
      const slope = dy / dx; // 斜率
      
      if (slope < 0.3) { // 太平
        return {correct: false, feedback: "捺的角度太平，应该更陡一些"};
      }
      
      if (slope > 3) { // 太陡
        return {correct: false, feedback: "捺的角度太陡，应该更平一些"};
      }
      
      // 检查长度是否足够
      if (distance < 30) {
        return {correct: false, feedback: "捺的长度不够，请画得更长一些"};
      }
      
      return {correct: true, feedback: "很好！捺画正确"};
    
    case "点":
      if (distance > 20) {
        return {correct: false, feedback: "点画应该短促有力"};
      }
      return {correct: true, feedback: "很好！点画正确"};
    
    case "折":
      // 重写折的识别逻辑，需要有明确的先横后竖再短撇的特征
      
      // 首先确认轨迹足够长
      if (points.length < 10) {
        return {correct: false, feedback: "折画轨迹太短，请完整绘制"};
      }
      
      // 找出关键转折点
      const segments = findSegments(points);
      
      // 检查是否至少有2个转折（形成3个段）
      if (segments.length < 3) {
        return {correct: false, feedback: "折画应该有明显的两个转折"};
      }
      
      // 提取3个主要段
      const firstSegment = segments[0];  // 应该是横
      const secondSegment = segments[1]; // 应该是竖
      const thirdSegment = segments[2];  // 应该是短撇
      
      // 检查第一段是否基本水平向右
      const angle1 = calculateSegmentAngle(firstSegment);
      if (Math.abs(angle1) > 30) {
        return {correct: false, feedback: "折画的第一段应该是横，从左向右"};
      }
      
      // 检查第二段是否基本垂直向下
      const angle2 = calculateSegmentAngle(secondSegment);
      if (Math.abs(angle2 - 90) > 30) {
        return {correct: false, feedback: "折画的第二段应该是竖，从上到下"};
      }
      
      // 检查第三段是否向右上方短撇
      const angle3 = calculateSegmentAngle(thirdSegment);
      // 右上方向的角度范围（约-45度到-135度之间）
      const isRightUpAngle = (angle3 < -10 && angle3 > -170);
      if (!isRightUpAngle) {
        return {correct: false, feedback: "折画的最后应该有一个向右上方的短勾"};
      }
      
      // 检查最后一段是否足够短（短勾）
      const thirdSegmentLength = calculateSegmentLength(thirdSegment);
      if (thirdSegmentLength > 50) {
        return {correct: false, feedback: "折画最后的勾应该短小"};
      }
      
      return {correct: true, feedback: "很好！折画正确"};
    
    default:
      return {correct: false, feedback: "无法识别的笔画类型"};
  }
}

// 帮助函数：找出路径中的段（基于转折点分段）
function findSegments(points: {x: number, y: number, time: number}[]): Array<Array<{x: number, y: number, time: number}>> {
  if (points.length < 3) return [points];
  
  const segments: Array<Array<{x: number, y: number, time: number}>> = [];
  let currentSegment: Array<{x: number, y: number, time: number}> = [points[0]];
  
  // 找出转折点
  const turnPoints = [0]; // 起始点始终是转折点
  
  for (let i = 2; i < points.length - 2; i++) {
    const prev = points[i-2];
    const curr = points[i];
    const next = points[i+2];
    
    const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
    const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
    
    // 计算角度差（绝对值）
    let angleDiff = Math.abs(angle1 - angle2);
    // 标准化到[0, π]
    angleDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);
    
    // 如果角度变化大于30度，认为是转折点
    if (angleDiff > Math.PI/6) {
      turnPoints.push(i);
    }
  }
  
  turnPoints.push(points.length - 1); // 终点始终是转折点
  
  // 基于转折点分段
  for (let i = 0; i < turnPoints.length - 1; i++) {
    segments.push(points.slice(turnPoints[i], turnPoints[i+1] + 1));
  }
  
  // 合并太短的段
  const mergedSegments: Array<Array<{x: number, y: number, time: number}>> = [];
  let currentMergedSegment = segments[0];
  
  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    // 如果段太短（少于5个点或距离小于15），则与前一段合并
    if (segment.length < 5 || 
        calculateSegmentLength(segment) < 15) {
      currentMergedSegment = [...currentMergedSegment, ...segment];
    } else {
      mergedSegments.push(currentMergedSegment);
      currentMergedSegment = segment;
    }
  }
  
  mergedSegments.push(currentMergedSegment);
  
  return mergedSegments;
}

// 帮助函数：计算段的角度
function calculateSegmentAngle(segment: Array<{x: number, y: number, time: number}>): number {
  if (segment.length < 2) return 0;
  const startPoint = segment[0];
  const endPoint = segment[segment.length - 1];
  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;
  return Math.atan2(dy, dx) * 180 / Math.PI;
}

// 帮助函数：计算段的长度
function calculateSegmentLength(segment: Array<{x: number, y: number, time: number}>): number {
  if (segment.length < 2) return 0;
  const startPoint = segment[0];
  const endPoint = segment[segment.length - 1];
  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;
  return Math.sqrt(dx*dx + dy*dy);
}

const StrokesScreen = () => {
  const navigation = useNavigation();
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);
  const [points, setPoints] = useState<{x: number, y: number, time: number}[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState("横");
  const [feedback, setFeedback] = useState("");
  
  // 添加对画布的引用
  const canvasRef = React.useRef<View>(null);
  // 触摸移动更新频率控制
  const lastUpdateTimeRef = React.useRef(0);
  // 存储画布的测量信息
  const [canvasMeasure, setCanvasMeasure] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  // 获取当前笔画信息
  const currentStrokeInfo = strokes[currentStrokeIndex];
  
  // 测量画布大小
  useEffect(() => {
    if (canvasRef.current) {
      // 确保在组件挂载后测量画布大小
      setTimeout(() => {
        canvasRef.current?.measure((x, y, width, height, pageX, pageY) => {
          setCanvasMeasure({ x: pageX, y: pageY, width, height });
        });
      }, 300);
    }
  }, []);
  
  // 切换到上一个笔画
  const goToPreviousStroke = () => {
    setCurrentStrokeIndex((currentStrokeIndex - 1 + strokes.length) % strokes.length);
  };
  
  // 切换到下一个笔画
  const goToNextStroke = () => {
    setCurrentStrokeIndex((currentStrokeIndex + 1) % strokes.length);
  };
  
  // 触发触感引导
  const triggerHapticFeedback = () => {
    Alert.alert("触感引导", "触感引导已启动，请感受振动模式");
    // 在实际应用中，这里应该触发设备振动
  };
  
  // 清空画布
  const clearCanvas = () => {
    setPoints([]);
    setFeedback("");
  };
  
  // 播放引导动画
  const playGuideAnimation = () => {
    // 在实际应用中，这里应该播放引导动画
    Alert.alert("播放引导", "正在播放笔画引导动画");
  };

  // 触摸开始
  const handleTouchStart = (e: GestureResponderEvent) => {
    if (!e.nativeEvent) return;
    
    setIsDrawing(true);
    // 重置笔迹
    setPoints([{
      x: e.nativeEvent.locationX || 0,
      y: e.nativeEvent.locationY || 0,
      time: Date.now()
    }]);
    
    // 清除反馈
    setFeedback("");
  };

  // 触摸移动
  const handleTouchMove = (e: GestureResponderEvent) => {
    if (!isDrawing || !e.nativeEvent) return;
    
    // 限制更新频率
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < 10) return;
    lastUpdateTimeRef.current = now;
    
    // 获取相对于视图的触摸坐标
    const { locationX, locationY } = e.nativeEvent;
    
    // 添加新点
    setPoints(prev => {
      if (prev.length === 0) return [{x: locationX, y: locationY, time: now}];
      
      // 获取上一个点
      const lastPoint = prev[prev.length - 1];
      
      // 计算与上一点的距离
      const distance = Math.sqrt(
        Math.pow(locationX - lastPoint.x, 2) + 
        Math.pow(locationY - lastPoint.y, 2)
      );
      
      // 如果距离异常大，可能是坐标计算问题或真正的跳跃
      if (distance > 30 && prev.length > 1) {
        // 创建平滑点
        const steps = Math.min(Math.ceil(distance / 10), 20); // 最多插入20个点，防止过多
        const interpolatedPoints = [];
        
        for (let i = 1; i <= steps; i++) {
          const ratio = i / steps;
          interpolatedPoints.push({
            x: lastPoint.x + (locationX - lastPoint.x) * ratio,
            y: lastPoint.y + (locationY - lastPoint.y) * ratio,
            time: now - (steps - i)
          });
        }
        
        return [...prev, ...interpolatedPoints];
      }
      
      // 添加新点
      return [...prev, {x: locationX, y: locationY, time: now}];
    });
  };

  // 触摸结束
  const handleTouchEnd = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    // 只有当有足够的点时才判断笔画
    if (points.length >= 5) {
      // 判断笔画
      const result = checkStroke(points, currentStroke);
      setFeedback(result.feedback);
      
      // 自动进入下一个笔画
      if (result.correct) {
        setTimeout(() => {
          // 清空画布，设置下一个笔画
          setPoints([]);
          setFeedback("");
          // 更新当前笔画
          setCurrentStroke(strokes[(currentStrokeIndex + 1) % strokes.length].name);
          setCurrentStrokeIndex((currentStrokeIndex + 1) % strokes.length);
        }, 1200);
      }
    } else {
      setFeedback("笔画太短了，请重试");
    }
  };

  // 添加 useEffect 来同步当前笔画状态
  useEffect(() => {
    setCurrentStroke(strokes[currentStrokeIndex].name);
  }, [currentStrokeIndex]);

  // 使用useMemo优化路径计算
  const pathData = useMemo(() => {
    if (points.length < 2) return "";
    
    return points.reduce((path, point, i) => {
      // 使用贝塞尔曲线平滑路径
      if (i === 0) {
        return `M ${point.x},${point.y}`;
      } else if (i === 1) {
        return path + ` L ${point.x},${point.y}`;
      } else {
        // 使用前一点和当前点的中点作为控制点
        const prev = points[i - 1];
        const cpX = (prev.x + point.x) / 2;
        const cpY = (prev.y + point.y) / 2;
        return path + ` Q ${prev.x},${prev.y} ${cpX},${cpY} L ${point.x},${point.y}`;
      }
    }, "");
  }, [points]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#e74c3c" barStyle="light-content" />
      
      {/* 顶部标题栏 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.appTitle}>笔画学习 - {currentStrokeInfo.name}</Text>
        <TouchableOpacity style={styles.voiceAssistButton}>
          <Text style={styles.voiceAssistIcon}>🔊</Text>
        </TouchableOpacity>
      </View>
      
      {/* 主要内容区域 - 采用flex布局使练习区域占据更多空间 */}
      <View style={styles.mainContent}>
        {/* 练习区域 */}
        <View style={styles.practiceArea}>
          <View style={styles.practiceHeader}>
            <Text style={styles.practiceTitle}>
              请书写<Text style={styles.currentStrokeText}>{currentStrokeInfo.name}</Text>笔画
              <Text style={styles.strokeDesc}> ({currentStrokeInfo.desc})</Text>
            </Text>
            <View style={styles.controlButtons}>
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={goToPreviousStroke}
              >
                <Text style={styles.controlButtonText}>◀</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={playGuideAnimation}
              >
                <Text style={styles.controlButtonText}>▶️</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={clearCanvas}
              >
                <Text style={styles.controlButtonText}>🔄</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={goToNextStroke}
              >
                <Text style={styles.controlButtonText}>▶</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.canvasContainer}>
            <View 
              ref={canvasRef}
              style={styles.canvas}
              onLayout={() => {
                // 组件布局完成时测量画布
                canvasRef.current?.measure((x, y, width, height, pageX, pageY) => {
                  setCanvasMeasure({ x: pageX, y: pageY, width, height });
                });
              }}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={(e) => {
                // 获取相对于视图的触摸坐标
                const { locationX, locationY } = e.nativeEvent;
                
                // 清除状态，开始新绘制
                setIsDrawing(true);
                setFeedback("");
                
                // 保存起点位置
                const startPoint = {
                  x: locationX,
                  y: locationY,
                  time: Date.now()
                };
                
                // 记录视图信息以便后续计算
                setPoints([startPoint]);
              }}
              onResponderMove={handleTouchMove}
              onResponderRelease={handleTouchEnd}
            >
              {/* 绘制区域，确保SVG覆盖整个区域并且位置计算正确 */}
              <Svg style={styles.svgContainer} width="100%" height="100%">
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
              <Text style={[
                styles.strokeHint,
                {opacity: points.length > 1 ? 0.05 : 0.2}
              ]}>
                {currentStrokeInfo.icon}
              </Text>
              
              {/* 反馈信息 */}
              <Text style={[
                styles.feedback,
                {color: feedback.includes("很好") ? "green" : "red"}
              ]}>
                {feedback}
              </Text>
              
              {/* 底部提示信息 */}
              <Text style={[
                styles.bottomTip,
                {color: points.length > 1 ? "transparent" : "#e74c3c"}
              ]}>
                {currentStrokeInfo.desc}
              </Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.feedbackButton}
              onPress={triggerHapticFeedback}
            >
              <Text style={styles.buttonText}>
                <Text style={{marginRight: 5}}>👆</Text>触感引导
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearCanvas}
            >
              <Text style={styles.buttonText}>
                <Text style={{marginRight: 5}}>🔄</Text>重新书写
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* 底部信息 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>视障人士汉字书写学习应用 © 2023</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    backgroundColor: '#e74c3c',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 12,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 22,
    color: 'white',
  },
  appTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  voiceAssistButton: {
    position: 'absolute',
    right: 12,
  },
  voiceAssistIcon: {
    fontSize: 20,
    color: 'white',
  },
  mainContent: {
    flex: 1,
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  practiceArea: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 10,
  },
  practiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  practiceTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  currentStrokeText: {
    fontWeight: 'bold',
    color: '#e74c3c',
    fontSize: 18,
  },
  strokeDesc: {
    fontSize: 13,
    color: '#666',
  },
  controlButtons: {
    flexDirection: 'row',
  },
  controlButton: {
    padding: 5,
    marginLeft: 2,
  },
  controlButtonText: {
    fontSize: 16,
    color: '#666',
  },
  canvasContainer: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 5,
    marginBottom: 15,
    overflow: 'hidden',
    minHeight: 400,
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  feedbackButton: {
    flex: 0,
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    padding: 10,
    backgroundColor: '#f1f1f1',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#777',
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
  clearButton: {
    flex: 0,
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 10,
  },
});

export default StrokesScreen; 