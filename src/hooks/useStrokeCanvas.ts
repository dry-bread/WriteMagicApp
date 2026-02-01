import { useState, useRef, useCallback, useMemo } from 'react';
import { GestureResponderEvent } from 'react-native';
import { StrokePoint } from '../constants/strokesData';
import { checkStroke } from '../utils/strokeRecognition';
import { VibrationHelper } from '../utils/vibrationHelper';

interface StrokeCanvasOptions {
  onFeedback?: (feedback: string, isCorrect: boolean) => void;
  onStrokeEnd?: (isCorrect: boolean) => void;
  minPointsRequired?: number;
  enableHapticFeedback?: boolean;
}

/**
 * 自定义Hook用于处理笔画绘制逻辑
 */
export default function useStrokeCanvas(expectedStroke: string, options: StrokeCanvasOptions = {}) {
  const {
    onFeedback,
    onStrokeEnd,
    minPointsRequired = 5,
    enableHapticFeedback = true,
  } = options;
  
  // 状态
  const [points, setPoints] = useState<StrokePoint[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [feedback, setFeedback] = useState('');
  
  // 引用
  const lastUpdateTimeRef = useRef(0);
  const lastHapticTimeRef = useRef(0);
  
  // 震动反馈函数
  const triggerHapticFeedback = useCallback((type: 'start' | 'move' | 'correct' | 'incorrect') => {
    if (!enableHapticFeedback) {
      return;
    }
    
    switch (type) {
      case 'start':
        // 开始绘制时的轻微震动
        VibrationHelper.safeVibrate(50);
        break;
      case 'move':
        // 绘制过程中的轻微触觉反馈（限制频率）
        const now = Date.now();
        if (now - lastHapticTimeRef.current > 100) { // 每100ms最多一次
          VibrationHelper.safeVibrate(10);
          lastHapticTimeRef.current = now;
        }
        break;
      case 'correct':
        // 正确完成笔画的愉悦震动模式
        VibrationHelper.safeVibrate([0, 100, 50, 100]);
        break;
      case 'incorrect':
        // 错误笔画的警告震动模式
        VibrationHelper.safeVibrate([0, 200, 100, 200, 100, 200]);
        break;
    }
  }, [enableHapticFeedback]);
  
  // 清空画布
  const clearCanvas = useCallback(() => {
    setPoints([]);
    setFeedback('');
  }, []);
  
  // 触摸开始
  const handleTouchStart = useCallback((e: GestureResponderEvent) => {
    console.log('=== handleTouchStart called ===');
    if (!e.nativeEvent) {
      console.log('No nativeEvent');
      return;
    }
    
    setIsDrawing(true);
    
    // 触发开始绘制的震动反馈
    triggerHapticFeedback('start');
    
    // 记录起点位置
    const startPoint = {
      x: e.nativeEvent.locationX || 0,
      y: e.nativeEvent.locationY || 0,
      time: Date.now(),
    };
    
    // 重置笔迹
    setPoints([startPoint]);
    
    // 清除反馈
    setFeedback('');
  }, [triggerHapticFeedback]);
  
  // 触摸移动
  const handleTouchMove = useCallback((e: GestureResponderEvent) => {
    if (!isDrawing || !e.nativeEvent) {
      return;
    }
    
    // 限制更新频率
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < 10) {
      return;
    }
    lastUpdateTimeRef.current = now;
    
    // 触发移动时的震动反馈
    triggerHapticFeedback('move');
    
    // 获取相对于视图的触摸坐标
    const { locationX, locationY } = e.nativeEvent;
    
    // 添加新点
    setPoints(prev => {
      if (prev.length === 0) {
        return [{x: locationX, y: locationY, time: now}];
      }
      
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
            time: now - (steps - i),
          });
        }
        
        return [...prev, ...interpolatedPoints];
      }
      
      // 添加新点
      return [...prev, {x: locationX, y: locationY, time: now}];
    });
  }, [isDrawing, triggerHapticFeedback]);
  
  // 触摸结束
  const handleTouchEnd = useCallback(() => {
    console.log('=== handleTouchEnd called ===, isDrawing:', isDrawing, 'points.length:', points.length);
    if (!isDrawing) {
      return;
    }
    
    setIsDrawing(false);
    
    // 只有当有足够的点时才判断笔画
    if (points.length >= minPointsRequired) {
      // 判断笔画
      console.log('Checking stroke with', points.length, 'points for:', expectedStroke);
      const result = checkStroke(points, expectedStroke);
      console.log('Stroke check result:', result);
      setFeedback(result.feedback);
      
      // 触发相应的震动反馈
      triggerHapticFeedback(result.correct ? 'correct' : 'incorrect');
      
      // 调用外部回调
      onFeedback?.(result.feedback, result.correct);
      onStrokeEnd?.(result.correct);
    } else {
      console.log('Stroke too short, points:', points.length, 'required:', minPointsRequired);
      const shortFeedback = '笔画太短了，请重试';
      setFeedback(shortFeedback);
      triggerHapticFeedback('incorrect');
      onFeedback?.(shortFeedback, false);
      onStrokeEnd?.(false);
    }
  }, [isDrawing, points, expectedStroke, minPointsRequired, onFeedback, onStrokeEnd, triggerHapticFeedback]);
  
  // 使用useMemo优化路径计算
  const pathData = useMemo(() => {
    if (points.length < 2) {
      return '';
    }
    
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
    }, '');
  }, [points]);
  
  // 响应器配置
  const responderHandlers = {
    onStartShouldSetResponder: () => true,
    onMoveShouldSetResponder: () => true,
    onResponderGrant: handleTouchStart,
    onResponderMove: handleTouchMove,
    onResponderRelease: handleTouchEnd,
  };
  
  return {
    points,
    isDrawing,
    feedback,
    pathData,
    clearCanvas,
    responderHandlers,
  };
}
