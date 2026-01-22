# 植物扫描器 - 安装部署手册

## 目录

1. [系统要求](#系统要求)
2. [快速开始](#快速开始)
3. [详细安装步骤](#详细安装步骤)
4. [环境变量配置](#环境变量配置)
5. [数据库设置](#数据库设置)
6. [本地开发](#本地开发)
7. [生产部署](#生产部署)
8. [小程序发布](#小程序发布)
9. [原生应用构建](#原生应用构建)
10. [故障排除](#故障排除)

---

## 系统要求

### 必需软件

| 软件 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | ≥ 18.0.0 | JavaScript 运行时 |
| npm | ≥ 9.0.0 | Node 包管理器 |
| Git | 任意版本 | 版本控制 |

### 可选软件

| 软件 | 版本要求 | 用途 |
|------|----------|------|
| PostgreSQL | ≥ 14 | 本地数据库（可选，使用 Supabase 云服务） |
| Docker | 任意版本 | 本地开发环境 |
| Xcode | ≥ 14 | iOS 原生构建（仅 macOS） |
| Android Studio | 任意版本 | Android 原生构建 |

### 技术栈概览

```
前端框架:    Taro 3 + React + TypeScript
状态管理:    Zustand + TanStack Query
UI 组件:    NutUI + 自定义样式
后端服务:    Vercel Serverless Functions
数据库:      Supabase (PostgreSQL)
对象存储:    Supabase Storage
身份认证:    Supabase Auth
错误监控:    Sentry
植物识别:    PlantNet API
数据源:      GBIF, Wikidata, iNaturalist, OpenFarm
```

---

## 快速开始

### 5 分钟快速启动

```bash
# 1. 克隆项目
git clone <repository-url>
cd plant-scanner

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件（见环境变量配置章节）

# 4. 设置数据库
# 在 Supabase 控制台执行 supabase/schema.sql

# 5. 启动开发服务器
npm run dev:h5
```

访问 http://localhost:10086 即可看到应用。

---

## 详细安装步骤

### 步骤 1: 克隆项目

```bash
# 克隆仓库
git clone https://github.com/your-username/plant-scanner.git
cd plant-scanner

# 初始化子模块（如果有）
git submodule update --init --recursive
```

### 步骤 2: 安装 Node.js

#### macOS

```bash
# 使用 Homebrew 安装
brew install node@20

# 或使用 nvm
nvm install 20
nvm use 20
```

#### Windows

```bash
# 从 https://nodejs.org 下载安装
# 或使用 winget
winget install OpenJS.NodeJS.LTS

# 或使用 nvm-windows
nvm install 20.0.0
nvm use 20.0.0
```

#### Linux (Ubuntu/Debian)

```bash
# 使用 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version  # 应显示 v20.x.x
npm --version   # 应显示 9.x.x
```

### 步骤 3: 安装项目依赖

```bash
# 安装根目录依赖
npm install

# 安装所有工作区依赖
npm install -ws

# 或分别安装
cd apps/h5 && npm install
cd ../miniapp && npm install
cd ../../packages/core && npm install
cd ../ui && npm install
```

### 步骤 4: 验证安装

```bash
# 检查 Node.js 版本
node --version

# 检查 npm 版本
npm --version

# 检查项目结构
ls -la

# 运行代码检查
npm run lint
```

---

## 环境变量配置

### 创建环境文件

```bash
# 从模板复制
cp .env.example .env
```

### 环境变量说明

#### 必需变量

```env
# ============================================
# Supabase 配置 - 必需
# ============================================

# Supabase 项目 URL
# 获取方式: Supabase 控制台 → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase 匿名密钥（前端使用）
# 获取方式: Supabase 控制台 → Settings → API → anon public
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase 服务密钥（后端/API 使用）
# ⚠️ 此值仅在服务端使用，不要暴露给前端
# 获取方式: Supabase 控制台 → Settings → API → service_role
SUPABASE_SERVICE_KEY=your-service-key
```

#### 植物识别 API

```env
# ============================================
# PlantNet API - 必需
# ============================================

# PlantNet 植物识别 API 密钥
# 获取方式: https://my.plantnet.org 注册申请
PLANTNET_API_KEY=your-plantnet-api-key
```

#### 可选变量

```env
# ============================================
# Sentry 错误监控 - 可选
# ============================================

# Sentry DSN（用于错误追踪）
# 获取方式: Sentry 控制台 → Settings → Projects → YOUR_PROJECT → Client Keys
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn

# ============================================
# Vercel 部署 - 可选
# ============================================

# Vercel 访问令牌
# 获取方式: https://vercel.com/settings/tokens
VERCEL_TOKEN=your-vercel-token

# Vercel 组织 ID
VERCEL_ORG_ID=your-org-id

# Vercel 项目 ID
VERCEL_PROJECT_ID=your-project-id

# ============================================
# 小程序配置 - 按需配置
# ============================================

# 微信小程序
WEAPP_APPID=your-wechat-appid
WEAPP_PRIVATE_KEY=your-wechat-private-key

# 支付宝小程序
ALIPAY_APPID=your-alipay-appid

# 抖音小程序
TOUTIAO_APPID=your-toutiao-appid

# QQ 小程序
QQ_APPID=your-qq-appid

# 百度小程序
BAIDU_APPID=your-baidu-appid
```

### 环境变量验证

创建 `.env.local` 用于本地覆盖：

```env
# .env.local - 此文件应被 .gitignore 忽略
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 数据库设置

### 选项 A: 使用 Supabase 云服务（推荐）

#### 1. 创建 Supabase 项目

1. 访问 https://supabase.com
2. 点击 "New Project"
3. 填写项目名称、密码
4. 等待项目创建完成（约 30 秒）

#### 2. 执行数据库 schema

在 Supabase 控制台中：

1. 点击左侧 "SQL Editor"
2. 点击 "New query"
3. 复制 `supabase/schema.sql` 内容
4. 点击 "Run" 执行

#### 3. 验证表创建

```sql
-- 检查表是否存在
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- 预期输出:
-- users
-- plant_species
-- user_plants
-- scan_records
-- care_tasks
-- reminder_configs
```

#### 4. 配置存储桶

在 Supabase 控制台中：

1. 点击左侧 "Storage"
2. 点击 "New bucket"
3. 填写 bucket 名称: `plant-images`
4. 设置为公开 bucket
5. 点击 "Create bucket"

#### 5. 配置身份认证

1. 点击左侧 "Authentication"
2. 点击 "Providers"
3. 启用 "Phone" 提供商
3. 配置 OAuth 提供商（WeChat, Apple, Google）

---

### 选项 B: 本地 PostgreSQL

#### 1. 安装 PostgreSQL

**macOS**

```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian**

```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows**

从 https://www.postgresql.org/download/windows/ 下载安装程序。

#### 2. 创建数据库和用户

```bash
sudo -u postgres psql

-- 在 psql 中执行:
CREATE USER plant_scanner WITH PASSWORD 'your_password';
CREATE DATABASE plant_scanner OWNER plant_scanner;
GRANT ALL PRIVILEGES ON DATABASE plant_scanner TO plant_scanner;

\q
```

#### 3. 导入 schema

```bash
psql -U plant_scanner -d plant_scanner -f supabase/schema.sql
```

#### 4. 配置本地 Supabase

由于本地没有 Supabase 完整服务，建议使用 Supabase CLI：

```bash
# 安装 Supabase CLI
npm install -g supabase

# 启动本地 Supabase
supabase init
supabase start

# 访问本地 Studio
# http://localhost:54323
```

---

## 本地开发

### 启动开发服务器

#### H5 应用

```bash
# 启动 H5 开发服务器
npm run dev:h5

# 输出:
# > TARO v3.6.23
# > webpack compiled successfully
# > Project running at http://localhost:10086/
```

#### 微信小程序

```bash
# 启动微信小程序开发
npm run dev:weapp

# 构建完成后，使用微信开发者工具打开 apps/miniapp/dist/weapp 目录
```

#### 支付宝小程序

```bash
npm run dev:alipay
```

#### 所有平台并行

```bash
# 安装 npm-run-all
npm install -D npm-run-all

# 启动多个开发服务器
npm-run-all --parallel dev:h5 dev:weapp
```

### 开发命令

| 命令 | 说明 |
|------|------|
| `npm run dev:h5` | 启动 H5 开发服务器 |
| `npm run dev:weapp` | 启动微信小程序开发 |
| `npm run dev:alipay` | 启动支付宝小程序开发 |
| `npm run build:h5` | 构建 H5 生产版本 |
| `npm run build:weapp` | 构建微信小程序 |
| `npm run build:alipay` | 构建支付宝小程序 |
| `npm run lint` | 运行 ESLint 检查 |
| `npm run format` | 格式化代码 |
| `npm run type-check` | TypeScript 类型检查 |
| `npm run data-sync` | 同步植物数据 |

### 热重载

Taro 支持以下热重载功能：

- **代码修改**: 自动重新编译
- **样式修改**: 局部刷新
- **配置文件修改**: 需要重启服务器

### 调试技巧

#### Chrome 调试 H5

1. 启动开发服务器: `npm run dev:h5`
2. 打开 http://localhost:10086
3. 打开 Chrome DevTools (F12)
4. 使用 Sources 面板调试源码

#### 微信小程序调试

1. 使用 `npm run dev:weapp` 构建
2. 打开微信开发者工具
3. 导入 `apps/miniapp/dist/weapp` 目录
4. 使用开发者工具的控制台调试

---

## 生产部署

### H5 部署到 Vercel

#### 方式一: Git 集成（推荐）

1. **推送代码到 GitHub**

```bash
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/plant-scanner.git
git push -u origin main
```

2. **连接 Vercel**

- 访问 https://vercel.com
- 点击 "Add New..." → "Project"
- 选择刚推送的仓库
- 配置 Root Directory: `apps/h5`
- 配置 Build Command: `npm run build:h5`
- 配置 Output Directory: `dist`
- 添加环境变量
- 点击 "Deploy"

3. **自动部署**

推送代码到 main 分支后，Vercel 自动部署。

#### 方式二: Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
cd apps/h5
vercel --prod

# 或使用配置文件
vercel --prod --token=your-token
```

### 配置自定义域名

在 Vercel 控制台中：

1. 进入项目 → Settings → Domains
2. 点击 "Add"
3. 输入域名
4. 配置 DNS 记录
5. 等待 DNS 传播（通常几分钟）

### 配置 SSL

Vercel 自动为自定义域名提供 Let's Encrypt SSL 证书。

### 环境变量部署

在 Vercel 控制台中：

1. 进入项目 → Settings → Environment Variables
2. 添加所有环境变量
3. 选择适用的环境（Production, Preview, Development）
4. 保存后自动生效

---

## 小程序发布

### 微信小程序

#### 1. 构建生产版本

```bash
cd apps/miniapp
npm run build:weapp
```

#### 2. 配置 AppID

在 `apps/miniapp/src/app.config.ts` 中：

```typescript
export default defineAppConfig({
  appKey: 'your-wechat-appid',
  // ...
});
```

#### 3. 微信开发者工具

1. 下载并安装微信开发者工具
2. 登录微信账号
3. 导入项目: `apps/miniapp/dist/weapp`
4. 在项目设置中填写 AppID

#### 4. 上传代码

1. 在微信开发者工具中点击 "上传"
2. 填写版本号和备注
3. 点击 "上传"

#### 5. 提交审核

1. 访问 https://mp.weixin.qq.com
2. 进入 "版本管理" → "开发版本"
3. 提交审核
4. 审核通过后发布

### 支付宝小程序

```bash
npm run build:alipay
```

使用支付宝小程序开发者工具导入 `apps/miniapp/dist/alipay` 目录。

### 抖音小程序

```bash
npm run build:tt
```

使用抖音开发者工具导入相应目录。

### 其他平台

| 平台 | 构建命令 | 输出目录 |
|------|----------|----------|
| QQ | `npm run build:qq` | `apps/miniapp/dist/qq` |
| 百度 | `npm run build:baidu` | `apps/miniapp/dist/baidu` |

---

## 原生应用构建

### iOS (需要 macOS)

#### 1. 安装依赖

```bash
cd apps/native
npm install
cd ios
pod install
```

#### 2. 配置 Xcode

1. 打开 `ios/PlantScanner.xcworkspace`
2. 在 Signing & Capabilities 中：
   - 选择 Team
   - 配置 Bundle Identifier
   - 启用 Push Notifications

#### 3. 配置推送证书

1. 在 Apple Developer Portal 创建 App ID
2. 启用 Push Notifications Capability
3. 创建 Development/Production SSL 证书
4. 导出 .p12 文件

#### 4. 构建

**模拟器**

```bash
cd apps/native/ios
xcodebuild -workspace PlantScanner.xcworkspace \
  -scheme PlantScanner \
  -destination 'platform=iOS Simulator,name=iPhone 14' \
  -configuration Debug \
  build
```

**TestFlight**

```bash
# 使用 Fastlane
fastlane beta
```

#### 5. 发布

1. 在 Xcode 中选择 "Any iOS Device"
2. Product → Archive
3. 在 Organizer 中点击 "Distribute App"
4. 选择 "TestFlight"
5. 按照向导完成发布

### Android

#### 1. 安装依赖

```bash
cd apps/native/android
./gradlew installDebug
```

#### 2. 配置签名

在 `android/app/build.gradle` 中：

```groovy
signingConfigs {
  release {
    if (project.hasProperty('RELEASE_STORE_FILE')) {
      storeFile file(RELEASE_STORE_FILE)
      storePassword RELEASE_STORE_PASSWORD
      keyAlias RELEASE_KEY_ALIAS
      keyPassword RELEASE_KEY_PASSWORD
    }
  }
}

buildTypes {
  release {
    signingConfig signingConfigs.release
  }
}
```

创建 `android/gradle.properties`：

```properties
RELEASE_STORE_FILE=/path/to/your/release.keystore
RELEASE_STORE_PASSWORD=your-store-password
RELEASE_KEY_ALIAS=your-key-alias
RELEASE_KEY_PASSWORD=your-key-password
```

#### 3. 构建

**调试版本**

```bash
cd apps/native/android
./gradlew assembleDebug
```

**发布版本**

```bash
./gradlew assembleRelease
```

APK 位于 `android/app/build/outputs/apk/release/`。

#### 4. 发布到 Google Play

使用 Fastlane：

```bash
fastlane supply --track production --json_key ../play-store-key.json --package_name com.plantscanner
```

---

## 故障排除

### 常见问题

#### 1. npm install 失败

**问题**: 依赖安装报错

**解决方案**:

```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules 重新安装
rm -rf node_modules package-lock.json
npm install

# 使用 npm ci 替代
npm ci
```

#### 2. Taro 构建失败

**问题**: webpack 或 Taro 构建报错

**解决方案**:

```bash
# 检查 Node.js 版本
node --version

# 升级 Taro
npm update @tarojs/cli

# 删除缓存
rm -rf .taro
npm run dev:h5
```

#### 3. Supabase 连接失败

**问题**: 无法连接数据库

**解决方案**:

```bash
# 检查环境变量
cat .env | grep SUPABASE

# 验证 URL 格式
# 正确: https://xxxxx.supabase.co
# 错误: https://xxxxx.supabase.co/

# 测试连接
curl -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/users?limit=1"
```

#### 4. PlantNet API 报错

**问题**: 植物识别返回错误

**解决方案**:

```bash
# 检查 API 密钥
echo $PLANTNET_API_KEY

# 测试 API
curl -X POST "https://my-api.plantnet.org/v2/identify" \
  -F "images=@test.jpg" \
  -F "organs=leaf" \
  -F "api-key=$PLANTNET_API_KEY"
```

#### 5. 小程序无法调用 API

**问题**: request 失败

**解决方案**:

1. 检查微信开发者工具是否开启「不校验合法域名」
2. 在小程序后台配置 request 合法域名:
   - `https://your-project.supabase.co`
   - `https://my-api.plantnet.org`
3. 配置域名时需要备案

#### 6. 推送通知不工作

**问题**: 收不到推送

**解决方案**:

**iOS**:
1. 检查 APNS 证书是否有效
2. 检查设备令牌是否正确保存
3. 检查证书是 Development 还是 Production

**Android**:
1. 检查 FCM 配置
2. 检查 google-services.json 是否正确
3. 检查设备是否有网络连接

#### 7. 样式不生效

**问题**: 样式丢失或不正确

**解决方案**:

```bash
# 清除缓存
rm -rf apps/h5/dist .taro

# 重新构建
npm run dev:h5
```

#### 8. 内存不足

**问题**: 构建时内存溢出

**解决方案**:

```bash
# 增加 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build:h5
```

### 日志查看

#### 开发日志

```bash
# 查看 Taro 构建日志
npm run dev:h5 2>&1 | tee build.log
```

#### Vercel 日志

在 Vercel 控制台中：
1. 进入项目 → Deployments
2. 点击最近的部署
3. 查看 "Function Logs"

### 获取帮助

- **GitHub Issues**: https://github.com/your-username/plant-scanner/issues
- **Taro 文档**: https://taro.zone/docs
- **Supabase 文档**: https://supabase.com/docs
- **PlantNet API**: https://my-api.plantnet.org/docs

---

## 附录

### 项目结构说明

```
plant-scanner/
├── apps/                    # 应用目录
│   ├── h5/                 # H5 Web 应用
│   ├── miniapp/            # 小程序
│   └── native/             # 原生应用（待实现）
├── packages/               # NPM 包
│   ├── core/               # 核心功能包
│   └── ui/                 # UI 组件包
├── api/                    # Vercel API 路由
├── supabase/               # 数据库 schema
├── scripts/                # 脚本
├── docs/                   # 文档
└── .github/                # GitHub 配置
```

### 相关链接

| 资源 | 链接 |
|------|------|
| 项目仓库 | https://github.com/your-username/plant-scanner |
| Taro 文档 | https://taro.zone/docs |
| Supabase | https://supabase.com |
| PlantNet API | https://my-api.plantnet.org |
| Vercel | https://vercel.com |
| Sentry | https://sentry.io |

---

**最后更新**: 2026-01-22
