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

// 定义汉字数据
const characters = [
  { name: "李 (lǐ)", char: "李", strokes: 7, info: "木部 + 子部" },
  { name: "明 (míng)", char: "明", strokes: 8, info: "日部 + 月部" },
  { name: "张 (zhāng)", char: "张", strokes: 7, info: "弓部 + 长部" },
  { name: "王 (wáng)", char: "王", strokes: 4, info: "基本汉字" },
  { name: "刘 (liú)", char: "刘", strokes: 6, info: "刀部 + 文部" }
];

// 李的笔顺示例
const liStrokes = [
  {type: "横", desc: "位于'木'部的顶部，从左向右画一条直线"},
  {type: "竖", desc: "从上到下画一条直线，贯穿'木'部中心"},
  {type: "横", desc: "在'木'部的中间位置，从左向右画一条直线"},
  {type: "撇", desc: "从'木'部右侧向左下方画一条斜线"},
  {type: "横", desc: "在'子'部的顶部，从左向右画一条直线"},
  {type: "撇", desc: "'子'部左侧，从上向左下方画一条斜线"},
  {type: "捺", desc: "'子'部右侧，从上向右下方画一条斜线"}
];

const CharactersScreen = () => {
  const navigation = useNavigation();
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);
  
  // 获取当前汉字信息
  const currentCharacter = characters[currentCharIndex];
  
  // 获取当前笔画信息
  const strokesData = liStrokes; // 这里仅使用李的笔顺，实际应根据当前汉字选择对应数据
  const totalStrokes = strokesData.length;
  const currentStroke = strokesData[currentStrokeIndex];
  
  // 切换到上一个汉字
  const goToPreviousCharacter = () => {
    setCurrentCharIndex((currentCharIndex - 1 + characters.length) % characters.length);
    setCurrentStrokeIndex(0); // 重置笔画索引
  };
  
  // 切换到下一个汉字
  const goToNextCharacter = () => {
    setCurrentCharIndex((currentCharIndex + 1) % characters.length);
    setCurrentStrokeIndex(0); // 重置笔画索引
  };
  
  // 进入下一个笔画
  const goToNextStroke = () => {
    if (currentStrokeIndex < totalStrokes - 1) {
      setCurrentStrokeIndex(currentStrokeIndex + 1);
    } else {
      Alert.alert("恭喜！", "您已完成当前汉字的所有笔画练习。");
    }
  };
  
  // 触发触感提示
  const triggerHapticFeedback = () => {
    Alert.alert("触感引导", "触感引导已启动，请感受振动模式");
    // 在实际应用中，这里应该触发设备振动
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
        <Text style={styles.appTitle}>单字练习</Text>
        <TouchableOpacity style={styles.voiceAssistButton}>
          <Text style={styles.voiceAssistIcon}>🔊</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.mainContent}>
          {/* 汉字选择器 */}
          <View style={styles.characterSelector}>
            <View style={styles.characterDisplay}>
              <View style={styles.currentCharacterContainer}>
                <Text style={styles.currentCharacter}>{currentCharacter.char}</Text>
              </View>
              <View style={styles.characterInfo}>
                <Text style={styles.characterName}>{currentCharacter.name}</Text>
                <Text style={styles.strokeCount}>{currentCharacter.strokes}画 - {currentCharacter.info}</Text>
              </View>
            </View>
            <View style={styles.characterNav}>
              <TouchableOpacity 
                style={styles.navButton}
                onPress={goToPreviousCharacter}
              >
                <Text style={styles.navButtonText}>◀</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.navButton}
                onPress={goToNextCharacter}
              >
                <Text style={styles.navButtonText}>▶</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* 练习区域 */}
          <View style={styles.practiceArea}>
            <View style={styles.practiceHeader}>
              <Text style={styles.practiceTitle}>逐笔练习</Text>
              <Text style={styles.progressInfo}>
                当前：<Text style={styles.currentStroke}>第{currentStrokeIndex+1}画 - {currentStroke.type}</Text> ({currentStrokeIndex+1}/{totalStrokes})
              </Text>
            </View>
            
            <View style={styles.canvasContainer}>
              <View style={styles.drawingCanvas} />
              <View style={styles.guideLayer}>
                <Text style={styles.characterOutline}>{currentCharacter.char}</Text>
              </View>
            </View>
            
            <View style={styles.controlButtons}>
              <TouchableOpacity 
                style={styles.hintButton}
                onPress={triggerHapticFeedback}
              >
                <Text style={styles.buttonText}>
                  <Text>👆</Text> 触感提示
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.nextStrokeButton}
                onPress={goToNextStroke}
              >
                <Text style={styles.buttonText}>
                  下一笔 <Text>→</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* 反馈面板 */}
          <View style={styles.feedbackPanel}>
            <Text style={styles.feedbackTitle}>当前笔画提示</Text>
            <View style={styles.feedbackContent}>
              <Text style={styles.feedbackText}>
                请画一<Text style={{fontWeight: 'bold'}}>{currentStroke.type}</Text>，{currentStroke.desc}。
              </Text>
              <Text style={styles.feedbackText}>
                当您准备好时，请按照语音和振动引导完成书写。
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
  characterSelector: {
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
  characterDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentCharacterContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#fff9e6',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  currentCharacter: {
    fontSize: 40,
    color: '#f39c12',
  },
  characterInfo: {
    flex: 1,
  },
  characterName: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 3,
    color: '#333',
  },
  strokeCount: {
    fontSize: 14,
    color: '#666',
  },
  characterNav: {
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
    flexWrap: 'wrap',
  },
  practiceTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333',
  },
  progressInfo: {
    fontSize: 14,
    color: '#666',
  },
  currentStroke: {
    fontWeight: 'bold',
    color: '#f39c12',
  },
  canvasContainer: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 5,
    marginBottom: 15,
    overflow: 'hidden',
    position: 'relative',
    aspectRatio: 1,
  },
  drawingCanvas: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f9f9f9',
  },
  guideLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  characterOutline: {
    fontSize: 200,
    color: 'rgba(0,0,0,0.1)',
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  hintButton: {
    flex: 1,
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  nextStrokeButton: {
    flex: 1,
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
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 15,
    color: '#333',
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

export default CharactersScreen; 