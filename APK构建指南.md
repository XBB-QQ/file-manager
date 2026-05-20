# 📱 文件管理器 APK 构建指南

## 🚀 快速开始 - 构建您的APK

### 前置条件
在您的电脑上需要安装：
1. **Node.js** (已安装)
2. **Android Studio** (需要安装)
3. **JDK 17+** (Android Studio自带)

---

## 📦 方案一：在您的电脑上构建APK（推荐）

### 第一步：将项目复制到您的电脑
复制整个 `/workspace` 文件夹到您的电脑

### 第二步：在您的电脑上安装依赖
```bash
cd /path/to/workspace
npm install
```

### 第三步：构建Web应用并同步到Android
```bash
npm run build
npx cap sync
```

### 第四步：使用Android Studio构建APK

#### 方式A：使用Android Studio（最简单）
1. 打开 Android Studio
2. 选择 "Open an Existing Project"
3. 选择 `/workspace/android` 文件夹
4. 等待 Gradle 同步完成
5. 点击菜单：**Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
6. 完成后，APK 位置：`android/app/build/outputs/apk/debug/app-debug.apk`

#### 方式B：命令行构建（高级用户）
```bash
cd android
./gradlew assembleDebug
```
APK 位置：`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📱 方案二：使用在线构建服务（无需安装Android Studio）

### 使用 GitHub Actions（免费）
1. 将项目推送到 GitHub
2. 创建 `.github/workflows/build.yml`
3. 自动构建并下载APK

### 使用 Ionic App Flow（付费）
1. 注册 https://ionic.io/appflow
2. 上传项目
3. 一键构建APK

---

## 🎨 应用配置

### 修改应用名称和图标
- **应用名称**：编辑 `android/app/src/main/res/values/strings.xml`
- **应用图标**：替换 `android/app/src/main/res/` 中的图标文件

### 修改版本号
编辑 `android/app/build.gradle`：
```gradle
versionCode 2        # 每次发布递增
versionName "1.1"    # 版本名称
```

---

## 🔧 当前项目状态

✅ **Capacitor已配置** - Android平台已添加
✅ **Web应用已构建** - `/workspace/dist/` 目录
✅ **Android项目已就绪** - `/workspace/android/` 目录

---

## 📲 安装APK到手机

1. 将 `app-debug.apk` 传输到手机
2. 在手机上打开并安装
3. 允许"未知来源"安装
4. 完成！

---

## 💡 提示

- **调试版APK**：可以直接安装测试
- **发布版APK**：需要签名才能发布到应用商店
- 如需发布版，请参考 Android 签名文档

祝您构建愉快！🎊
