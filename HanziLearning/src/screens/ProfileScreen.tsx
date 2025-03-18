import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [characters, setCharacters] = useState<string[]>([]);

  // 处理姓名输入，将姓名拆分为单个汉字
  const handleNameChange = (text: string) => {
    setName(text);
    if (text.trim()) {
      // 将输入的文本拆分为单个字符
      setCharacters(text.split(''));
    } else {
      setCharacters([]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#9b59b6" barStyle="light-content" />
      
      {/* 顶部标题栏 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.appTitle}>个人信息设置</Text>
        <TouchableOpacity style={styles.voiceAssistButton}>
          <Text style={styles.voiceAssistIcon}>🔊</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.mainContent}>
          <Text style={styles.sectionTitle}>请输入您的姓名</Text>
          
          <View style={styles.formContainer}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>您的姓名</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="请说出或输入您的姓名"
                  value={name}
                  onChangeText={handleNameChange}
                />
                <TouchableOpacity style={styles.voiceInput}>
                  <Text style={styles.voiceInputIcon}>🎤</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.statusMessage}>点击麦克风开始语音输入</Text>
            </View>
            
            <View style={styles.characterContainer}>
              <Text style={styles.characterTitle}>您的姓名将被拆分为以下汉字：</Text>
              <View style={styles.characterList}>
                {characters.length > 0 ? (
                  characters.map((char, index) => (
                    <TouchableOpacity key={index} style={styles.characterItem}>
                      <Text style={styles.characterText}>{char}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  // 默认显示示例
                  <>
                    <TouchableOpacity style={styles.characterItem}>
                      <Text style={styles.characterText}>李</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.characterItem}>
                      <Text style={styles.characterText}>明</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.startButton}>
                <Text style={styles.startButtonText}>开始学习</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.learningPlan}>
            <Text style={styles.sectionTitle}>您的个性化学习计划</Text>
            <View style={styles.formContainer}>
              <Text>基于您的姓名，我们将按以下顺序进行学习：</Text>
              <View style={styles.planList}>
                <View style={styles.planItem}>
                  <Text style={styles.planNumber}>1</Text>
                  <Text style={styles.planText}>基础笔画练习 (横、竖、撇、捺、点等)</Text>
                </View>
                {characters.length > 0 ? (
                  characters.map((char, index) => (
                    <View key={index} style={styles.planItem}>
                      <Text style={styles.planNumber}>{index + 2}</Text>
                      <Text style={styles.planText}>单字"{char}"的笔顺和书写</Text>
                    </View>
                  ))
                ) : (
                  <>
                    <View style={styles.planItem}>
                      <Text style={styles.planNumber}>2</Text>
                      <Text style={styles.planText}>单字"李"的笔顺和书写</Text>
                    </View>
                    <View style={styles.planItem}>
                      <Text style={styles.planNumber}>3</Text>
                      <Text style={styles.planText}>单字"明"的笔顺和书写</Text>
                    </View>
                  </>
                )}
                <View style={styles.planItem}>
                  <Text style={styles.planNumber}>{characters.length > 0 ? characters.length + 2 : 4}</Text>
                  <Text style={styles.planText}>完整签名"{name || '李明'}"的练习</Text>
                </View>
              </View>
              <Text style={styles.planNote}>每个环节都将配备触摸反馈和语音引导</Text>
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
    backgroundColor: '#9b59b6',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 30,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
  },
  voiceInput: {
    position: 'absolute',
    right: 10,
  },
  voiceInputIcon: {
    fontSize: 20,
    color: '#777',
  },
  statusMessage: {
    fontStyle: 'italic',
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  characterContainer: {
    marginTop: 30,
  },
  characterTitle: {
    fontWeight: 'bold',
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  characterList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 20,
  },
  characterItem: {
    width: 70,
    height: 70,
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  characterText: {
    fontSize: 24,
    color: '#333',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  startButton: {
    backgroundColor: '#9b59b6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 5,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  learningPlan: {
    marginBottom: 20,
  },
  planList: {
    marginTop: 10,
    marginBottom: 20,
  },
  planItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  planNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#9b59b6',
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 10,
    fontSize: 14,
    fontWeight: 'bold',
  },
  planText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  planNote: {
    marginTop: 20,
    color: '#666',
    fontSize: 14,
  },
  assistantButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#9b59b6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  assistantIcon: {
    fontSize: 24,
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

export default ProfileScreen; 