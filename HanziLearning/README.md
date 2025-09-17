# 视障人士汉字书写学习应用

这是一个专为视障人士设计的汉字书写学习应用，通过触摸反馈和语音引导，帮助视障人士学习汉字书写。

## 功能模块

### 1. 个人信息设置
- 语音引导输入个人姓名
- 系统自动分解姓名为单个汉字
- 根据姓名生成个性化学习计划

### 2. 笔画学习模块
- 基础笔画教学（横、竖、撇、捺、点等）
- 每种笔画配有特定的震动模式
- 语音详细讲解笔画书写方向和力度

### 3. 单字练习模块
- 按笔画顺序学习名字中的每个字
- 逐笔引导系统，语音提示下一笔画
- 震动轮廓引导手指沿正确路径移动

### 4. 完整签名训练
- 连贯书写整个名字
- 字与字之间的空间控制指导
- 模拟真实签名场景的练习

## 技术栈

- React Native 0.78.0
- TypeScript
- React Navigation (Native Stack)
- React Native SVG (绘制功能)
- React Native Gesture Handler (触摸手势)
- React Native TTS (语音合成)
- React Native Voice (语音识别)
- 原生震动API (触觉反馈)

## 安装与运行

### 安装依赖

```bash
npm install
```

### 运行应用

```bash
# 运行Android版本
npm run android

# 运行iOS版本
npm run ios
```

### 打包APK

如果您想要打包成可分享给他人的Android APK文件：

```bash
# 进入android目录
cd android

# 打包发布版本APK
.\gradlew assembleRelease
```

打包完成后，APK文件将生成在：
```
android/app/build/outputs/apk/release/app-release.apk
```

**注意：** 发布版本需要签名证书。如果需要快速测试版本，也可以使用调试版本：

```bash
# 打包调试版本APK
.\gradlew assembleDebug
```

调试版本APK位置：
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## 项目结构

```
HanziLearning/
├── src/
│   ├── screens/         # 页面组件
│   │   ├── HomeScreen.tsx
│   │   ├── StrokeSelectionScreen.tsx
│   │   ├── StrokesScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── CharactersScreen.tsx
│   │   └── SignatureScreen.tsx
│   ├── components/      # 可复用组件
│   │   ├── StrokeCanvas.tsx
│   │   ├── StrokeControls.tsx
│   │   └── ActionButtons.tsx
│   ├── hooks/           # 自定义Hooks
│   │   └── useStrokeCanvas.ts
│   ├── utils/           # 工具函数
│   │   ├── strokeRecognition.ts
│   │   └── vibrationHelper.ts
│   ├── constants/       # 常量定义
│   │   └── strokesData.ts
│   ├── styles/          # 样式文件
│   │   └── commonStyles.ts
│   └── assets/          # 静态资源
├── android/             # Android项目文件
├── ios/                 # iOS项目文件
├── App.tsx              # 应用入口
└── index.js             # 注册应用
```

## 开发进度

- [x] 首页
- [x] 笔画选择页面 
- [x] 笔画学习模块
- [x] 震动反馈功能
- [x] 语音辅助功能  
- [x] 视障人士无障碍支持
- [ ] 个人信息设置页面
- [ ] 单字练习模块
- [ ] 完整签名训练

## 贡献指南

欢迎提交问题和功能请求。如果您想贡献代码，请先创建一个issue讨论您想要更改的内容。

## 许可证

MIT
