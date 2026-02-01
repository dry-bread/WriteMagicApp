import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Alert,
  AccessibilityInfo,
  findNodeHandle,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

// 导入常量和组件
import { strokes } from '../constants/strokesData';
import StrokeCanvas from '../components/StrokeCanvas';
import StrokeControls from '../components/StrokeControls';
import ActionButtons from '../components/ActionButtons';
import commonStyles from '../styles/commonStyles';

type RootStackParamList = {
  StrokeSelection: undefined;
  Strokes: { selectedStrokeIndex?: number };
};

type StrokesScreenRouteProp = RouteProp<RootStackParamList, 'Strokes'>;

/**
 * 笔画学习主屏幕
 */
const StrokesScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<StrokesScreenRouteProp>();
  
  // 从路由参数获取初始笔画索引，如果没有传递则默认为0
  const initialStrokeIndex = route.params?.selectedStrokeIndex ?? 0;
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState(initialStrokeIndex);
  
  // 获取当前笔画信息
  const currentStrokeInfo = strokes[currentStrokeIndex];
  
  // 切换到上一个笔画
  const goToPreviousStroke = useCallback(() => {
    setCurrentStrokeIndex((prevIndex) => (prevIndex - 1 + strokes.length) % strokes.length);
  }, []);
  
  // 切换到下一个笔画
  const goToNextStroke = useCallback(() => {
    setCurrentStrokeIndex((prevIndex) => (prevIndex + 1) % strokes.length);
  }, []);
  
  // 清空画布
  const clearCanvas = useCallback(() => {
    // 该方法将传递给StrokeCanvas组件，
    // StrokeCanvas内部通过useStrokeCanvas钩子处理清除逻辑
  }, []);
  
  // 播放引导动画
  const playGuideAnimation = useCallback(() => {
    // 在实际应用中，这里应该播放引导动画
    Alert.alert('播放引导', '正在播放笔画引导动画');
  }, []);
  
  // 处理正确笔画后的操作
  const handleCorrectStroke = useCallback((isCorrect: boolean) => {
    if (isCorrect) {
      // 延迟一小段时间后自动进入下一个笔画
      setTimeout(() => {
        // 更新当前笔画
        setCurrentStrokeIndex((prevIndex) => (prevIndex + 1) % strokes.length);
      }, 1200);
    }
  }, []);

  return (
    <SafeAreaView style={commonStyles.container}>
      <StatusBar backgroundColor="#e74c3c" barStyle="light-content" />
      
      {/* 顶部标题栏 */}
      <View style={commonStyles.header}>
        <TouchableOpacity
          style={commonStyles.backButton}
          onPress={() => navigation.goBack()}
          accessible={true}
          accessibilityLabel="返回上一页"
          accessibilityRole="button"
          accessibilityElementsHidden={false}
        >
          <Text style={commonStyles.backButtonText}>返回</Text>
        </TouchableOpacity>
        <Text 
          style={commonStyles.appTitle}
          accessible={true}
          accessibilityRole="header"
        >
          笔画学习 - {currentStrokeInfo.name}
        </Text>
      </View>
      
      {/* 主要内容区域 */}
      <View style={commonStyles.mainContent}>
        {/* 练习区域 */}
        <View style={commonStyles.contentCard}>
          {/* 控制按钮 */}
          <StrokeControls
            title="请书写"
            currentStrokeName={currentStrokeInfo.name}
            strokeDesc={currentStrokeInfo.desc}
            onPrevious={goToPreviousStroke}
            onNext={goToNextStroke}
            onClear={clearCanvas}
            onPlayGuide={playGuideAnimation}
          />
          
          {/* 绘制画布 */}
          <StrokeCanvas
            key="stroke-canvas"
            currentStroke={currentStrokeInfo.name}
            strokeIcon={currentStrokeInfo.icon}
            strokeDesc={currentStrokeInfo.desc}
            onCorrectStroke={handleCorrectStroke}
          />
          
          {/* 操作按钮 */}
          <ActionButtons
            onClearCanvas={clearCanvas}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default StrokesScreen;
