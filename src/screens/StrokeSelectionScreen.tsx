import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  AccessibilityInfo,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// 导入常量和样式
import { strokes } from '../constants/strokesData';
import commonStyles from '../styles/commonStyles';

type RootStackParamList = {
  Home: undefined;
  StrokeSelection: undefined;
  Strokes: { selectedStrokeIndex?: number };
};

type StrokeSelectionNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'StrokeSelection'
>;

/**
 * 笔画选择屏幕
 * 让用户选择要学习的笔画类型
 */
const StrokeSelectionScreen = () => {
  const navigation = useNavigation<StrokeSelectionNavigationProp>();

  // 页面加载时播报说明
  useEffect(() => {
    const announcePageInfo = async () => {
      // 检查是否启用了屏幕阅读器
      const isScreenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      
      if (isScreenReaderEnabled) {
        // 延迟一下确保页面完全加载
        setTimeout(() => {
          AccessibilityInfo.announceForAccessibility(
            '选择要学习的笔画页面。请选择您要学习的笔画，点击下方按钮开始学习对应笔画。'
          );
        }, 1000);
      }
    };

    announcePageInfo();
  }, []);

  // 处理笔画选择
  const handleStrokeSelection = (strokeIndex: number) => {
    navigation.navigate('Strokes', { selectedStrokeIndex: strokeIndex });
  };

  return (
    <SafeAreaView style={commonStyles.container}>
      <StatusBar backgroundColor="#e74c3c" barStyle="light-content" />
      
      {/* 顶部标题栏 */}
      <View style={commonStyles.header}>
        <TouchableOpacity
          style={commonStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={commonStyles.backButtonText}>返回主页面</Text>
        </TouchableOpacity>
        <Text style={commonStyles.appTitle}>选择要学习的笔画</Text>
      </View>
      
      {/* 主要内容区域 */}
      <View style={commonStyles.mainContent}>
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionTitle}>请选择您要学习的笔画</Text>
          <Text style={styles.instructionSubtitle}>点击下方按钮开始学习对应的笔画</Text>
        </View>

        <ScrollView
          style={styles.strokeList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.strokeListContent}
        >
          {strokes.map((stroke, index) => (
            <TouchableOpacity
              key={index}
              style={styles.strokeItem}
              onPress={() => handleStrokeSelection(index)}
              accessibilityLabel={`学习${stroke.name}，${stroke.desc}`}
              accessibilityRole="button"
              accessibilityHint="双击进入学习页面"
            >
              <View style={styles.strokeIconContainer}>
                <Text style={styles.strokeIcon}>{stroke.icon}</Text>
              </View>
              <View style={styles.strokeTextContainer}>
                <Text style={styles.strokeName}>{stroke.name}</Text>
                <Text style={styles.strokeDescription}>{stroke.desc}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* 底部信息 */}
      <View style={commonStyles.footer}>
        <Text style={commonStyles.footerText}>视障人士汉字书写学习应用 © 2023</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  instructionContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  instructionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  strokeList: {
    flex: 1,
  },
  strokeListContent: {
    paddingBottom: 20,
  },
  strokeItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    // 增大触摸区域以便视障人士操作
    minHeight: 80,
  },
  strokeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e74c3c',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  strokeIcon: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
  },
  strokeTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  strokeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  strokeDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 20,
  },
  arrow: {
    fontSize: 24,
    color: '#999',
    marginLeft: 10,
  },
});

export default StrokeSelectionScreen;
