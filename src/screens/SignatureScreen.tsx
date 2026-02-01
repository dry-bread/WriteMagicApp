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

// 定义签名示例
const signatureExamples = [
  { name: "李明", description: "李明的完整签名", strokes: 15 },
  { name: "张伟", description: "张伟的完整签名", strokes: 15 },
  { name: "王刚", description: "王刚的完整签名", strokes: 10 },
  { name: "刘洋", description: "刘洋的完整签名", strokes: 16 },
];

const SignatureScreen = () => {
  const navigation = useNavigation();
  const [currentSignatureIndex, setCurrentSignatureIndex] = useState(0);
  const [practiceStage, setPracticeStage] = useState('guide'); // 'guide', 'practice', 'feedback'
  const [attemptCount, setAttemptCount] = useState(0);
  
  // 获取当前签名信息
  const currentSignature = signatureExamples[currentSignatureIndex];
  
  // 切换到上一个签名
  const goToPreviousSignature = () => {
    setCurrentSignatureIndex((currentSignatureIndex - 1 + signatureExamples.length) % signatureExamples.length);
    resetPractice();
  };
  
  // 切换到下一个签名
  const goToNextSignature = () => {
    setCurrentSignatureIndex((currentSignatureIndex + 1) % signatureExamples.length);
    resetPractice();
  };
  
  // 重置练习状态
  const resetPractice = () => {
    setPracticeStage('guide');
    setAttemptCount(0);
  };
  
  // 开始练习
  const startPractice = () => {
    setPracticeStage('practice');
  };
  
  // 提交练习
  const submitPractice = () => {
    setPracticeStage('feedback');
    setAttemptCount(attemptCount + 1);
  };
  
  // 重试当前签名
  const retrySignature = () => {
    setPracticeStage('guide');
  };

  // 渲染练习阶段内容
  const renderPracticeStage = () => {
    switch (practiceStage) {
      case 'guide':
        return (
          <View style={styles.stageContainer}>
            <Text style={styles.stageTitle}>签名引导</Text>
            <View style={styles.guideContainer}>
              <Text style={styles.signatureOutline}>{currentSignature.name}</Text>
            </View>
            <Text style={styles.guideText}>
              请观察上方签名的形态和笔画。{currentSignature.name}总共有{currentSignature.strokes}画。
              当您准备好练习时，请点击"开始练习"按钮。
            </Text>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={startPractice}
            >
              <Text style={styles.buttonText}>开始练习</Text>
            </TouchableOpacity>
          </View>
        );
      
      case 'practice':
        return (
          <View style={styles.stageContainer}>
            <Text style={styles.stageTitle}>签名练习</Text>
            <View style={styles.practiceContainer}>
              {/* 这里应放置实际的签名绘制画布组件 */}
              <View style={styles.drawingCanvas} />
              <View style={styles.guideOverlay}>
                <Text style={[styles.signatureOutline, {opacity: 0.1}]}>{currentSignature.name}</Text>
              </View>
            </View>
            <View style={styles.controlRow}>
              <TouchableOpacity 
                style={[styles.controlButton, {backgroundColor: '#e74c3c'}]}
                onPress={resetPractice}
              >
                <Text style={styles.buttonText}>重置</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.controlButton}
                onPress={() => Alert.alert("触感引导", "触感引导已启动，请感受振动模式")}
              >
                <Text style={styles.buttonText}>触感引导</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.controlButton, {backgroundColor: '#f39c12'}]}
                onPress={submitPractice}
              >
                <Text style={styles.buttonText}>提交</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      
      case 'feedback':
        return (
          <View style={styles.stageContainer}>
            <Text style={styles.stageTitle}>练习反馈</Text>
            <View style={styles.feedbackContainer}>
              <View style={styles.comparisonRow}>
                <View style={styles.comparisonItem}>
                  <Text style={styles.comparisonLabel}>标准签名</Text>
                  <View style={styles.signaturePreview}>
                    <Text style={[styles.signatureOutline, {fontSize: 40}]}>{currentSignature.name}</Text>
                  </View>
                </View>
                <View style={styles.comparisonItem}>
                  <Text style={styles.comparisonLabel}>您的签名</Text>
                  <View style={styles.signaturePreview}>
                    {/* 这里应显示用户的签名 */}
                    <Text style={[styles.signatureOutline, {fontSize: 40, color: '#3498db'}]}>{currentSignature.name}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.feedbackTextContainer}>
                <Text style={styles.feedbackText}>
                  您的签名与标准模板相似度为85%。
                </Text>
                <Text style={styles.feedbackText}>
                  您的"李"字第3、4画需要调整，"明"字笔画连接处可以更加流畅。
                </Text>
                <Text style={styles.feedbackText}>
                  这是您的第{attemptCount}次尝试。请继续练习以提高签名准确度。
                </Text>
              </View>
            </View>
            <View style={styles.feedbackButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, {backgroundColor: '#3498db'}]}
                onPress={retrySignature}
              >
                <Text style={styles.buttonText}>再次练习</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={goToNextSignature}
              >
                <Text style={styles.buttonText}>下一个签名</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f39c12" barStyle="light-content" />
      
      {/* 顶部标题栏 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.appTitle}>完整签名练习</Text>
        <TouchableOpacity style={styles.voiceAssistButton}>
          <Text style={styles.voiceAssistIcon}>🔊</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.mainContent}>
          {/* 签名选择器 */}
          <View style={styles.signatureSelector}>
            <View style={styles.signatureInfo}>
              <Text style={styles.signatureName}>{currentSignature.name}</Text>
              <Text style={styles.signatureDescription}>{currentSignature.description}</Text>
            </View>
            <View style={styles.signatureNav}>
              <TouchableOpacity 
                style={styles.navButton}
                onPress={goToPreviousSignature}
              >
                <Text style={styles.navButtonText}>◀</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.navButton}
                onPress={goToNextSignature}
              >
                <Text style={styles.navButtonText}>▶</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* 练习阶段 */}
          {renderPracticeStage()}
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
    backgroundColor: '#f39c12',
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
  signatureSelector: {
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
  signatureInfo: {
    flex: 1,
  },
  signatureName: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 5,
    color: '#333',
  },
  signatureDescription: {
    fontSize: 14,
    color: '#666',
  },
  signatureNav: {
    flexDirection: 'row',
    gap: 10,
  },
  navButton: {
    padding: 5,
  },
  navButtonText: {
    fontSize: 24,
    color: '#666',
  },
  stageContainer: {
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
  stageTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333',
    marginBottom: 15,
  },
  guideContainer: {
    aspectRatio: 2,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signatureOutline: {
    fontSize: 80,
    color: '#f39c12',
  },
  guideText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#f39c12',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  practiceContainer: {
    aspectRatio: 2,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 5,
    marginBottom: 15,
    position: 'relative',
  },
  drawingCanvas: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f9f9f9',
  },
  guideOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  controlButton: {
    flex: 1,
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  feedbackContainer: {
    marginBottom: 20,
  },
  comparisonRow: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  comparisonItem: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonLabel: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  signaturePreview: {
    width: '100%',
    aspectRatio: 2,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  feedbackTextContainer: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  feedbackText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  assistantButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f39c12',
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

export default SignatureScreen; 