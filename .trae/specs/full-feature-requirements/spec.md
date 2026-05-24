# 文件管理器完整功能需求规格

## Why
当前文件管理器已具备骨架功能（文件浏览、分类、工具、我的），但分类扫描不完整、文件预览不完善、操作项缺失。需要以产品经理视角，为所有可见功能模块编写完整、可落地、可验收的需求文档。

## What Changes
- **文件模块**：完善文件浏览、多选操作、搜索、排序、新建/重命名/删除/复制/移动
- **分类模块**：全设备递归扫描按类型分类、分类详情列表、文件预览、批量操作
- **工具模块**：垃圾清理、存储分析、大文件扫描、文件搜索跳转、其余工具提供明确占位
- **我的模块**：存储统计、菜单项操作、退出

## Impact
- Affected specs: N/A (first spec)
- Affected code: `src/pages/FileExplorer.tsx`, `src/pages/Categories.tsx`, `src/pages/Tools.tsx`, `src/pages/Me.tsx`, `src/services/systemInfo.ts`, `src/services/filesystem.ts`, `src/store/useFileStore.ts`

---

## Module 1: 文件 (FileExplorer) — 文件浏览与管理

### Requirement 1.1: 目录浏览
系统 SHALL 在授权后加载并展示设备外部存储目录结构。

#### Scenario: 首次打开请求权限
- **WHEN** 用户首次打开应用，进入文件页
- **THEN** 系统检查存储权限：无权限则显示权限请求引导，用户授权后加载根目录文件列表

#### Scenario: 已授权直接加载
- **WHEN** 用户已授予存储权限，进入文件页
- **THEN** 直接展示根目录（/storage/emulated/0）下的文件和文件夹列表

#### Scenario: 进入子文件夹
- **WHEN** 用户点击某个文件夹
- **THEN** 进入该文件夹，路径栏更新显示当前路径，展示该文件夹内所有文件和子文件夹

#### Scenario: 返回上级
- **WHEN** 用户点击路径栏的"←"返回按钮
- **THEN** 返回上一级目录，刷新文件列表

#### 技术要求
- 使用 `@capacitor/filesystem` 的 `readdir` + `Directory.ExternalStorage`
- 每个文件/文件夹需获取：名称、类型、大小（文件）、修改时间
- 显示加载状态（loading spinner）和空目录提示

### Requirement 1.2: 视图切换
系统 SHALL 支持网格视图和列表视图两种文件展示方式。

#### Scenario: 切换视图
- **WHEN** 用户在工具栏点击网格/列表切换按钮
- **THEN** 文件列表在网格模式和列表模式之间切换，图标状态随视图改变

#### 技术要求
- 网格：大图标 + 文件名 + 大小，每行 3 列
- 列表：小图标 + 文件名 + 大小 + 修改时间，单列

### Requirement 1.3: 文件排序
系统 SHALL 支持按名称、大小、修改时间、类型对文件排序。

#### Scenario: 切换排序
- **WHEN** 用户在工具栏点击排序按钮或从菜单选择排序方式
- **THEN** 文件列表按选定字段重新排列，当前排序方式有视觉指示

### Requirement 1.4: 文件预览
系统 SHALL 在用户点击文件时弹出预览，支持图片、视频、音频、文本文件的内容查看。

#### Scenario: 预览图片
- **WHEN** 用户点击一个 .jpg / .png / .gif / .webp / .bmp 文件
- **THEN** 系统读取文件内容，以全屏模式展示图片，显示文件名和大小，点击空白区域或 X 关闭

#### Scenario: 预览视频/音频
- **WHEN** 用户点击一个 .mp4 / .mkv / .webm / .mp3 / .wav 文件
- **THEN** 系统读取文件内容，使用内置播放器播放，提供播放控制条

#### Scenario: 预览文本
- **WHEN** 用户点击一个 .txt / .md / .json / .xml / .html / .log / .csv 文件
- **THEN** 系统读取并展示文本内容，黑底绿字等宽字体（终端风格），最大显示 50000 字符

#### Scenario: 不支持预览
- **WHEN** 用户点击一个 .pdf / .doc / .apk / .zip 等不支持内建预览的文件
- **THEN** 系统展示文件信息卡片（名称、大小、路径、类型、修改时间），提示"不支持预览此格式"

#### Scenario: 超大文件
- **WHEN** 用户点击大小超过 100MB 的文件
- **THEN** 直接展示文件信息卡片，不尝试加载内容，避免 OOM

#### 技术要求
- 图片：`Filesystem.readFile` → base64 → `<img src="data:image/...;base64,...">`
- 视频/音频：base64 → Uint8Array → Blob → URL.createObjectURL → `<video>` / `<audio>`
- 文本：TextDecoder 解码 → `<pre>`
- 大文件保护：size > 100MB 直接跳 info 模式

### Requirement 1.5: 文件搜索
系统 SHALL 支持按文件名递归搜索设备存储中的文件。

#### Scenario: 搜索文件
- **WHEN** 用户在工具栏点击搜索图标，输入关键词并点击搜索
- **THEN** 系统递归扫描存储目录（跳过 Android 和点开头目录），返回匹配文件列表
- **AND** 每个结果显示文件名、完整路径、大小
- **AND** 点击结果跳转到对应文件所在目录（文件夹）或打开预览（文件）

#### Scenario: 无匹配结果
- **WHEN** 搜索关键词未匹配到任何文件
- **THEN** 显示"未找到匹配文件"

#### 技术要求
- 递归扫描需排序阈值保护（最多 50 条结果）
- 跳过 `/Android/data` 和 `.` 开头目录避免性能问题

### Requirement 1.6: 文件操作（多选模式）
系统 SHALL 支持对文件和文件夹进行批量选择和操作。

#### Scenario: 进入多选
- **WHEN** 用户长按任意文件/文件夹，或点击工具栏 ⋮ More 按钮
- **THEN** 进入多选模式，工具栏切换显示已选数量和操作按钮（全选、复制、剪切、删除、取消）

#### Scenario: 选择文件
- **WHEN** 用户在多选模式下点击文件/文件夹
- **THEN** 该文件/文件夹切换选中状态，视觉高亮（蓝色背景），计数器更新

#### Scenario: 全选
- **WHEN** 用户点击"全选"按钮
- **THEN** 当前目录所有文件/文件夹被选中

#### Scenario: 复制文件
- **WHEN** 用户选中文件后点击"复制"
- **THEN** 选中的文件/文件夹加入剪切板（copy 模式），显示粘贴提示栏

#### Scenario: 剪切文件
- **WHEN** 用户选中文件后点击"剪切"
- **THEN** 选中的文件/文件夹加入剪切板（cut 模式），显示粘贴提示栏

#### Scenario: 粘贴文件
- **WHEN** 用户在剪切板有内容时导航到目标目录，点击"粘贴"
- **THEN** shear板中的文件/文件夹被复制或移动到当前目录，刷新列表

#### Scenario: 删除文件
- **WHEN** 用户选中文件后点击"删除"
- **THEN** 系统弹出确认对话框
- **AND** 确认后删除选中文件/文件夹，刷新列表
- **AND** 取消后不做操作

#### 技术要求
- 删除使用 `Filesystem.deleteFile` / `Filesystem.rmdir`
- 复制使用 `Filesystem.readFile` + `Filesystem.writeFile`
- 剪切 = 复制 + 删除原文件
- `clipboard` 状态保存在 zustand store 中

### Requirement 1.7: 新建文件夹
系统 SHALL 支持在当前目录下创建新文件夹。

#### Scenario: 创建文件夹
- **WHEN** 用户在工具栏点击 📁+ 新建文件夹
- **THEN** 工具栏下方出现输入框，输入文件夹名称
- **WHEN** 用户按 Enter 或点击"确定"
- **THEN** 在当前目录创建新文件夹，关闭输入框，刷新列表
- **WHEN** 用户按 Escape 或点击 ✕
- **THEN** 关闭输入框，不做操作

#### Scenario: 名称为空或创建失败
- **WHEN** 名称为空或文件系统创建失败
- **THEN** 弹出提示"创建文件夹失败"

### Requirement 1.8: 重命名
系统 SHALL 支持对文件和文件夹重命名。

#### Scenario: 重命名
- **WHEN** 用户点击文件/文件夹右侧的 ✏️ 图标
- **THEN** 工具栏下方出现重命名输入框，预填当前名称
- **WHEN** 用户修改名称后按 Enter 或点击"确定"
- **THEN** 文件/文件夹被重命名，关闭输入框，刷新列表
- **WHEN** 用户按 Escape 或点击 ✕
- **THEN** 取消重命名，关闭输入框

#### Scenario: 重名冲突
- **WHEN** 新名称与同目录中已有文件/文件夹同名
- **THEN** 弹出提示"重命名失败"

### Requirement 1.9: 侧边栏快速访问
系统 SHALL 提供侧边栏，包含常用路径快捷入口和分类入口。

#### Scenario: 打开侧边栏
- **WHEN** 用户点击 ☰ 菜单按钮
- **THEN** 左侧滑出侧边栏，覆盖文件列表

#### Scenario: 快捷访问
- **WHEN** 用户点击"内部存储" / "下载"
- **THEN** 文件列表跳转到对应目录，侧边栏关闭
- **WHEN** 用户点击"收藏夹" / "最近"
- **THEN** 文件列表跳转到根目录，侧边栏关闭

#### Scenario: 分类入口
- **WHEN** 用户点击"图片" / "视频" / "音乐" / "文档"
- **THEN** 导航到分类页（/categories），侧边栏关闭

---

## Module 2: 分类 (Categories) — 文件分类浏览

### Requirement 2.1: 全设备文件扫描与分类
系统 SHALL 扫描设备外部存储，按扩展名将文件归类为 图片/视频/音乐/文档/应用/压缩包/其他 七大类。

#### Scenario: 扫描并分类
- **WHEN** 用户进入分类页且已授权存储权限
- **THEN** 系统扫描根目录及所有一级子目录（跳过 Android/点开头目录）
- **AND** 每个文件按扩展名归类：
  - 图片：jpg, jpeg, png, gif, webp, bmp, svg, heic, heif
  - 视频：mp4, avi, mov, wmv, flv, mkv, webm, 3gp, m4v
  - 音乐：mp3, wav, flac, aac, ogg, m4a, wma, opus
  - 文档：pdf, doc, docx, xls, xlsx, ppt, pptx, txt, md, csv, json, xml, html
  - 应用：apk
  - 压缩包：zip, rar, 7z, tar, gz, bz2, xz
  - 其他：不属于以上分类的文件
- **AND** 在页面顶部显示总文件数和总大小

#### Scenario: 扫描中
- **WHEN** 扫描进行中
- **THEN** 显示 loading spinner + "正在扫描文件..."

#### Scenario: 无权限
- **WHEN** 未授权存储权限
- **THEN** 显示权限请求按钮，不进行扫描

#### 技术要求
- 扫描范围：根目录 + 每子文件夹一层（非递归全设备，避免性能问题）
- 每个文件获取大小（stat），计入分类总大小
- 分类数据保存为 `Record<string, CategoryFiles>` 结构

### Requirement 2.2: 分类卡片展示
系统 SHALL 以卡片网格形式展示七种文件分类。

#### Scenario: 展示分类卡片
- **WHEN** 扫描完成
- **THEN** 每种分类显示为一张卡片，包含图标、名称、文件数量、总大小
- **AND** 有文件的卡片具有点击交互（hover 阴影、cursor pointer）
- **AND** 无文件的卡片半透明（opacity-60），不可点击

#### 技术要求
- 3 列网格布局
- 每个卡片显示大图标 + 分类名 + "N 个" + 格式化大小

### Requirement 2.3: 分类详情列表
系统 SHALL 支持点击分类卡片进入该分类的文件列表视图。

#### Scenario: 进入分类详情
- **WHEN** 用户点击一个有文件的分类卡片
- **THEN** 页面切换到该分类的详情视图
- **AND** 顶部显示分类名、文件数量、总大小、返回按钮
- **AND** 文件按大小降序排列，每个条目显示：图标、文件名、完整路径、大小

#### Scenario: 预览分类中文件
- **WHEN** 用户点击详情列表中的文件条目
- **THEN** 弹出文件预览（规则同 Requirement 1.4）

#### Scenario: 删除分类中文件
- **WHEN** 用户点击文件条目右侧的 🗑️ 图标
- **THEN** 该文件被删除，列表和总数/总大小实时更新

#### Scenario: 返回分类首页
- **WHEN** 用户点击返回按钮
- **THEN** 返回分类卡片首页，自动重新扫描以刷新数据

### Requirement 2.4: 快捷访问区
系统 SHALL 在分类首页顶部提供快捷访问入口。

#### Scenario: 点击快捷访问
- **WHEN** 用户点击"下载" / "内部存储" / "收藏夹" / "最近文件"
- **THEN** 均跳转到文件首页（/）

### Requirement 2.5: 刷新
系统 SHALL 支持手动刷新分类数据。

#### Scenario: 刷新
- **WHEN** 用户点击分类首页蓝色信息卡中的刷新按钮
- **THEN** 重新扫描全设备并更新分类数据

---

## Module 3: 工具 (Tools) — 实用工具集

### Requirement 3.1: 垃圾清理
系统 SHALL 支持扫描 Download 目录，列出可清理文件，支持逐项删除。

#### Scenario: 扫描可清理文件
- **WHEN** 用户点击"垃圾清理"卡片或工具按钮
- **THEN** 系统扫描 Download 目录，列出所有文件
- **AND** 显示每个文件的名称、大小和删除按钮
- **AND** 显示总文件数和可清理空间

#### Scenario: 逐项删除
- **WHEN** 用户点击某文件的"删除"按钮
- **THEN** 该文件被删除，总计更新，已清理空间提示

#### Scenario: 关闭清理结果
- **WHEN** 用户点击"关闭"
- **THEN** 清理结果面板隐藏，恢复工具页

#### 技术要求
- 扫描 `/Download`（ExternalStorage 下的 Download）
- 确认每个文件存在后才列出
- 使用 `Filesystem.deleteFile` 删除

### Requirement 3.2: 存储分析
系统 SHALL 展示按文件类型分类的存储空间占用图表。

#### Scenario: 查看存储分析
- **WHEN** 用户点击"存储分析"卡片或工具按钮
- **THEN** 弹出模态框，按类型展示存储占用柱状图
- **AND** 每类显示名称、大小、百分比进度条、颜色标记

#### Scenario: 切换到大文件扫描
- **WHEN** 用户在模态框中点击"大文件"标签
- **THEN** 展示大于 50MB 的文件列表（名称、路径、大小）

#### 技术要求
- 数据来源：`scanFilesByCategory()` 各类别总大小
- 进度条宽度 = 当前类大小 / 总大小 × 100%

### Requirement 3.3: 文件搜索入口
系统 SHALL 提供跳转到文件首页进行搜索的快捷入口。

#### Scenario: 点击文件搜索
- **WHEN** 用户点击工具页"文件搜索"按钮
- **THEN** 跳转到文件首页（/），用户可在首页工具栏使用搜索功能

### Requirement 3.4: 应用管理入口
系统 SHALL 提供最小化应用进入系统设置的快捷操作。

#### Scenario: 点击应用管理
- **WHEN** 用户点击工具页"应用管理"按钮
- **THEN** 系统调用 `App.minimizeApp()` 最小化应用，用户可在桌面进入系统设置管理应用

### Requirement 3.5: 功能占位
对于无法离线实现的网络相关工具，系统 SHALL 弹出明确提示。

#### Scenario: 点击网络/云/蓝牙/FTP 工具
- **WHEN** 用户点击"网络分析"/"云存储"/"FTP服务"/"蓝牙传输"
- **THEN** 弹出提示"功能开发中"

#### Scenario: 功能复用的工具
- **WHEN** 用户点击"安全扫描"/"电池优化"/"进程管理"
- **THEN** 分别复用大文件扫描/存储分析/垃圾清理功能

---

## Module 4: 我的 (Me) — 个人中心

### Requirement 4.1: 存储统计
系统 SHALL 展示设备存储使用概览。

#### Scenario: 查看存储统计
- **WHEN** 用户进入"我的"页面且已授权存储权限
- **THEN** 展示三个统计卡片：文件总数、文件夹数（根目录下）、总占用空间

#### Scenario: 无权限时
- **WHEN** 未授权存储权限
- **THEN** 统计区显示权限请求按钮

#### Scenario: 刷新统计
- **WHEN** 用户点击刷新按钮
- **THEN** 重新扫描并更新统计数据

#### 技术要求
- 文件数：扫描 Pictures/Download/Documents/Music/Movies 目录文件总数
- 文件夹数：统计根目录下文件夹数量
- 总大小：上述目录文件大小总和

### Requirement 4.2: 菜单列表
系统 SHALL 提供功能菜单入口。

#### Scenario: 菜单项操作
- **WHEN** 用户点击"下载管理" → 跳转到文件首页（/）
- **WHEN** 用户点击"关于" → 弹出应用版本信息（"文件管理器 v1.0\n管理你的手机文件"）
- **WHEN** 用户点击其他菜单项（设置/主题/深色模式/通知/隐私/收藏/分享/帮助） → 弹出"功能开发中"

### Requirement 4.3: 退出应用
系统 SHALL 支持从应用内退出。

#### Scenario: 退出应用
- **WHEN** 用户点击"退出"按钮
- **THEN** 调用 `App.exitApp()` 退出应用
- **AND** 如果退出失败，弹出提示"无法退出应用"

### Requirement 4.4: 用户信息展示
系统 SHALL 在页面顶部展示应用品牌信息。

#### Scenario: 展示品牌
- **WHEN** 用户进入"我的"页面
- **THEN** 顶部蓝色渐变区域展示应用名称"文件管理器"和副标题"管理你的手机文件"、用户头像图标