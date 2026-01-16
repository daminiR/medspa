const path = require('path');

module.exports = {
  expo: {
    name: "Luxe MedSpa Charting",
    slug: "luxe-medspa-charting",
    version: "1.0.0",
    orientation: "landscape",
    icon: "./assets/icon.png",
    scheme: "luxemedspa",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#8b5cf6"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.luxemedspa.charting",
      requireFullScreen: false,
      infoPlist: {
        NSCameraUsageDescription: "We need camera access to take treatment photos",
        NSPhotoLibraryUsageDescription: "We need photo library access to save treatment photos",
        NSMicrophoneUsageDescription: "We need microphone access for voice dictation"
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#8b5cf6"
      },
      edgeToEdgeEnabled: true,
      package: "com.luxemedspa.charting"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-camera",
        {
          cameraPermission: "Allow Luxe MedSpa to access your camera for treatment photos."
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "Allow Luxe MedSpa to access your photos for treatment documentation."
        }
      ]
    ],
    experiments: {
      typedRoutes: true,
      autolinkingModuleResolution: true
    },
    extra: {
      router: {
        origin: false
      },
      eas: {
        projectId: "your-project-id"
      },
      // Set environment variables for runtime
      EXPO_ROUTER_APP_ROOT: process.env.EXPO_ROUTER_APP_ROOT || "app",
      EXPO_ROUTER_ABS_APP_ROOT: process.env.EXPO_ROUTER_ABS_APP_ROOT || path.resolve(__dirname, "app")
    }
  }
};
