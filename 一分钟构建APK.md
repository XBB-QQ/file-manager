# 🚀 一分钟快速构建APK！（最简单方案）

## 步骤：

### 1️⃣ 在 GitHub 创建仓库
访问 https://github.com/new 创建一个新仓库

### 2️⃣ 上传项目
在您的电脑上：
```bash
# 将 /workspace 文件夹复制到您的电脑
cd /path/to/workspace

# 初始化 Git
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/您的用户名/您的仓库名.git
git push -u origin main
```

### 3️⃣ 自动构建！
- 推送后，GitHub Actions 会**自动开始构建APK**
- 在仓库页面点击 **Actions** 标签
- 等待约 3-5 分钟
- 在构建结果中点击 **app-debug** 下载APK！

---

## 📱 就这么简单！

**无需安装Android Studio**，**无需配置环境**，完全免费！

---

## 💡 提示

- APK 位置：Actions → Build APK → 最新的构建 → Artifacts → app-debug
- 下载后传到手机安装即可！

---

## 🎉 完成！

您的文件管理器APK很快就准备好了！🚀
