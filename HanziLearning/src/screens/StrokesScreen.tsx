import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// 定义笔画数据
const strokes = [
  { name: "横", icon: "一", desc: "从左到右画一条直线" },
  { name: "竖", icon: "丨", desc: "从上到下画一条直线" },
  { name: "撇", icon: "丿", desc: "从右上向左下画斜线" },
  { name: "捺", icon: "㇏", desc: "从左上向右下画斜线" },
  { name: "点", icon: "丶", desc: "轻点用力按下" },
  { name: "折", icon: "⺄", desc: "转折改变方向" }
];

const StrokesScreen = () => {
  const navigation = useNavigation();
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);
  
  // 获取当前笔画信息
  const currentStroke = strokes[currentStrokeIndex];
  
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
    // 在实际应用中，这里应该清空画布
    Alert.alert("清空画布", "画布已清空");
  };
  
  // 播放引导动画
  const playGuideAnimation = () => {
    // 在实际应用中，这里应该播放引导动画
    Alert.alert("播放引导", "正在播放笔画引导动画");
  };

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
        <Text style={styles.appTitle}>笔画学习</Text>
        <TouchableOpacity style={styles.voiceAssistButton}>
          <Text style={styles.voiceAssistIcon}>🔊</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.mainContent}>
          {/* 笔画选择器 */}
          <View style={styles.strokeSelector}>
            <View style={styles.strokeDisplay}>
              <Text style={styles.currentStrokeIcon}>{currentStroke.icon}</Text>
              <View style={styles.strokeInfo}>
                <Text style={styles.strokeName}>{currentStroke.name}</Text>
                <Text style={styles.strokeDesc}>{currentStroke.desc}</Text>
                <View style={styles.vibrationPattern}>
                  <View style={[styles.vibrationDot, styles.dotLow]} />
                  <View style={[styles.vibrationDot, styles.dotMedium]} />
                  <View style={[styles.vibrationDot, styles.dotHigh]} />
                </View>
              </View>
            </View>
            <View style={styles.strokeNav}>
              <TouchableOpacity 
                style={styles.navButton}
                onPress={goToPreviousStroke}
              >
                <Text style={styles.navButtonText}>◀</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.navButton}
                onPress={goToNextStroke}
              >
                <Text style={styles.navButtonText}>▶</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* 练习区域 */}
          <View style={styles.practiceArea}>
            <View style={styles.practiceHeader}>
              <Text style={styles.practiceTitle}>
                练习区域 - 请按照语音提示绘制<Text style={styles.currentStrokeText}>{currentStroke.name}</Text>笔画
              </Text>
              <View style={styles.controlButtons}>
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
              </View>
            </View>
            
            <View style={styles.canvasContainer}>
              <View style={styles.drawingCanvas} />
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
                style={styles.nextButton}
                onPress={goToNextStroke}
              >
                <Text style={styles.buttonText}>
                  下一个笔画 <Text style={{marginLeft: 5}}>→</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* 反馈面板 */}
          <View style={styles.feedbackPanel}>
            <View style={styles.feedbackTitle}>
              <Text style={styles.feedbackTitleText}>学习提示</Text>
              <Text style={styles.feedbackTitleIcon}>💡</Text>
            </View>
            <View style={styles.feedbackContent}>
              <Text style={styles.feedbackText}>
                <Text style={{fontWeight: 'bold'}}>{currentStroke.name}</Text>
                笔画是{currentStroke.desc}。
              </Text>
              <Text style={styles.feedbackText}>
                使用指尖轻触屏幕左侧，然后保持均匀力度向右滑动。
              </Text>
              <Text style={styles.feedbackText}>
                注意感受振动引导：开始轻微，中间适中，结束加强。
              </Text>
              <Text style={styles.feedbackText}>
                系统会通过语音和振动来引导您完成笔画。
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* 语音助手按钮 */}
      <TouchableOpacity style={styles.assistantButton}>
        <Text style={styles.assistantIcon}>🗣️</Text>
      </TouchableOpacity>
      
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
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#e74c3c',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 15,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: 'white',
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  voiceAssistButton: {
    position: 'absolute',
    right: 15,
  },
  voiceAssistIcon: {
    fontSize: 22,
    color: 'white',
  },
  mainContent: {
    padding: 20,
  },
  strokeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 20,
  },
  strokeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentStrokeIcon: {
    fontSize: 32,
    color: '#e74c3c',
    marginRight: 15,
  },
  strokeInfo: {
    flex: 1,
  },
  strokeName: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
    color: '#333',
  },
  strokeDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  vibrationPattern: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 5,
    padding: 5,
    backgroundColor: '#f1f1f1',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  vibrationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e74c3c',
    marginHorizontal: 2,
  },
  dotLow: {
    opacity: 0.3,
  },
  dotMedium: {
    opacity: 0.6,
  },
  dotHigh: {
    opacity: 1,
  },
  strokeNav: {
    flexDirection: 'row',
    gap: 10,
  },
  navButton: {
    padding: 10,
  },
  navButtonText: {
    fontSize: 20,
    color: '#666',
  },
  practiceArea: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 20,
  },
  practiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
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
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  controlButton: {
    padding: 5,
  },
  controlButtonText: {
    fontSize: 18,
    color: '#666',
  },
  canvasContainer: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 5,
    marginBottom: 15,
    overflow: 'hidden',
  },
  drawingCanvas: {
    width: '100%',
    height: 300,
    backgroundColor: '#f9f9f9',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feedbackButton: {
    flex: 1,
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginRight: 5,
    alignItems: 'center',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  feedbackPanel: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  feedbackTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  feedbackTitleText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  feedbackTitleIcon: {
    fontSize: 20,
  },
  feedbackContent: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    marginBottom: 15,
  },
  feedbackText: {
    marginBottom: 10,
    fontSize: 14,
    color: '#333',
  },
  assistantButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e74c3c',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  assistantIcon: {
    fontSize: 28,
    color: 'white',
  },
  footer: {
    padding: 15,
    backgroundColor: '#f1f1f1',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#777',
  },
});

export default StrokesScreen; 