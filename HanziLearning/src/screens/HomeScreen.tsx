import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  StrokeSelection: undefined;
  Strokes: { selectedStrokeIndex?: number };
  Characters: undefined;
  Signature: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#3498db" barStyle="light-content" />

      {/* 顶部标题栏 */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>汉字书写学习</Text>
      </View>

      {/* 主要内容区域 */}
      <View style={styles.mainContent}>
        <View style={styles.welcomeMessage}>
          <Text style={styles.welcomeTitle}>欢迎使用汉字书写学习</Text>
          <Text style={styles.welcomeSubtitle}>通过触摸和声音引导，帮助您学习书写汉字</Text>
        </View>

        <View style={styles.menuContainer}>

          {/* 笔画学习模块 */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('StrokeSelection')}
          >
            <View style={[styles.menuIcon, styles.iconStroke]}>
              <Text style={styles.iconText}>✏️</Text>
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuTitle}>笔画学习</Text>
              <Text style={styles.menuDescription}>学习基础笔画：横、竖、撇、捺、点等</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          {/* 个人信息设置 */}
          {/**
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={[styles.menuIcon, styles.iconProfile]}>
              <Text style={styles.iconText}>👤</Text>
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuTitle}>个人信息设置</Text>
              <Text style={styles.menuDescription}>设置您的姓名并创建个性化学习计划</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          */}

          {/* 单字练习模块 */}
          {/**
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Characters')}
          >
            <View style={[styles.menuIcon, styles.iconCharacter]}>
              <Text style={styles.iconText}>字</Text>
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuTitle}>单字练习</Text>
              <Text style={styles.menuDescription}>逐笔引导学习单个汉字的书写</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          */}

          {/* 完整签名训练 */}
          {/**
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Signature')}
          >
            <View style={[styles.menuIcon, styles.iconSignature]}>
              <Text style={styles.iconText}>✍️</Text>
            </View>
            <View style={styles.menuText}>
              <Text style={styles.menuTitle}>完整签名训练</Text>
              <Text style={styles.menuDescription}>练习连贯书写您的全名</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
          */}
        </View>
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
    backgroundColor: '#3498db',
    padding: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
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
    flex: 1,
    padding: 20,
  },
  welcomeMessage: {
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  menuContainer: {
    gap: 15,
  },
  menuItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  iconProfile: {
    backgroundColor: '#9b59b6',
  },
  iconStroke: {
    backgroundColor: '#e74c3c',
  },
  iconCharacter: {
    backgroundColor: '#f39c12',
  },
  iconSignature: {
    backgroundColor: '#2ecc71',
  },
  iconText: {
    fontSize: 24,
    color: 'white',
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  menuDescription: {
    fontSize: 14,
    color: '#777',
  },
  arrow: {
    fontSize: 20,
    color: '#999',
  },
  assistantButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
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

export default HomeScreen;
