import { StrokePoint, StrokeSegment, StrokeType } from '../constants/strokesData';

/**
 * 检查用户绘制的笔画是否符合预期类型
 */
export function checkStroke(
  points: StrokePoint[], 
  expectedStroke: StrokeType
): {correct: boolean, feedback: string} {
  
  // 至少要有一定数量的点
  if (points.length < 2) {
    return {correct: false, feedback: "笔画太短了，请重试"};
  }
  
  // 提取关键特征
  const startPoint = points[0];
  const endPoint = points[points.length - 1];
  
  // 计算主要方向
  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;
  const distance = Math.sqrt(dx*dx + dy*dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  
  // 检查笔画速度
  const duration = endPoint.time - startPoint.time; // 毫秒
  
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
      if (distance > 30) {
        return {correct: false, feedback: "点画应该短促有力"};
      }
      return {correct: true, feedback: "很好！点画正确"};
    
    case "折":
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

/**
 * 找出路径中的段（基于转折点分段）
 */
export function findSegments(points: StrokePoint[]): StrokeSegment[] {
  if (points.length < 3) return [points];
  
  const segments: StrokeSegment[] = [];
  
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
  const mergedSegments: StrokeSegment[] = [];
  let currentMergedSegment = segments[0];
  
  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    // 如果段太短（少于5个点或距离小于15），则与前一段合并
    if (segment.length < 5 || calculateSegmentLength(segment) < 15) {
      currentMergedSegment = [...currentMergedSegment, ...segment];
    } else {
      mergedSegments.push(currentMergedSegment);
      currentMergedSegment = segment;
    }
  }
  
  mergedSegments.push(currentMergedSegment);
  
  return mergedSegments;
}

/**
 * 计算段的角度
 */
export function calculateSegmentAngle(segment: StrokeSegment): number {
  if (segment.length < 2) return 0;
  const startPoint = segment[0];
  const endPoint = segment[segment.length - 1];
  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;
  return Math.atan2(dy, dx) * 180 / Math.PI;
}

/**
 * 计算段的长度
 */
export function calculateSegmentLength(segment: StrokeSegment): number {
  if (segment.length < 2) return 0;
  const startPoint = segment[0];
  const endPoint = segment[segment.length - 1];
  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;
  return Math.sqrt(dx*dx + dy*dy);
} 