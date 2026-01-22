# Plant Scanner - React Native App

## 项目结构

```
apps/native/
├── src/
│   ├── App.tsx                 # 应用入口
│   ├── index.js                # RN 入口
│   ├── providers/              # Context Providers
│   │   ├── SupabaseProvider.tsx
│   │   ├── AuthProvider.tsx
│   │   └── index.ts
│   ├── navigation/             # 导航
│   │   ├── RootNavigator.tsx
│   │   ├── TabNavigator.tsx
│   │   └── index.ts
│   ├── screens/                # 页面
│   │   ├── AuthScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── GardenScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   ├── CameraScreen.tsx
│   │   ├── ResultScreen.tsx
│   │   ├── PlantDetailScreen.tsx
│   │   ├── AddPlantScreen.tsx
│   │   └── index.ts
│   ├── components/             # 组件
│   ├── services/               # 服务
│   ├── hooks/                  # Hooks
│   ├── types/                  # 类型定义
│   └── utils/                  # 工具函数
├── ios/                        # iOS 项目
│   ├── PlantScanner/
│   │   ├── Info.plist
│   │   ├── LaunchScreen.storyboard
│   │   └── ...
│   └── PlantScanner.xcworkspace
├── android/                    # Android 项目
│   ├── app/src/main/
│   │   ├── java/com/plantscanner/
│   │   │   ├── MainApplication.java
│   │   │   └── MainActivity.java
│   │   └── res/
│   │       ├── values/
│   │       ├── drawable/
│   │       └── mipmap-*/
│   └── build.gradle
├── package.json
└── tsconfig.json
```

## 安装

```bash
cd apps/native

# 安装依赖
npm install

# iOS
cd ios
pod install
cd ..

# Android
cd android
./gradlew installDebug
```

## 运行

```bash
# iOS
npm run ios

# Android
npm run android
```

## 构建

```bash
# iOS Debug
npm run build:ios:debug

# iOS Release (TestFlight)
npm run build:ios:release

# Android Debug
npm run build:android:debug

# Android Release
npm run build:android:release
```

## 环境变量

在 `android/app/build.gradle` 中配置:

```groovy
android {
  defaultConfig {
    manifestPlaceholders = [
      SUPABASE_URL: "your-supabase-url",
      SUPABASE_ANON_KEY: "your-anon-key"
    ]
  }
}
```

或在 `ios/PlantScanner/Info.plist` 中配置。
