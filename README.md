# 🚀 react-native-downloader

The easiest way to download files in React Native.
Stop rewriting file download logic in React Native!

“The simplest and most reliable way to download files in React Native with progress, permissions, and file handling built-in.”

## ✨ Features

- 📥 **Download with progress:** Get clean `0 → 100` progress natively without UI freezing.
- 📂 **Smart file naming:** Auto-detects extensions natively if not provided.
- 🔐 **Auto permission handling:** Graceful fallback to cache directories or handles permissions automatically on Android.
- ⚡ **Lightweight & fast:** 100% pure native code (Kotlin and Swift) **without any third-party dependencies**.
- 🛠 **Structured Error Handling:** Clean JS promises with `{ success: false, error: 'NETWORK_ERROR' }` instead of silent failures.

---

## 💻 Installation

```sh
npm install @chavanrk/react-native-downloader
# or
yarn add @chavanrk/react-native-downloader
```

_Note: Since this library uses pure native TurboModules/NativeModules, please make sure to run `pod install` in your `ios/` directory!_

---

## ✨ Example Usage

```javascript
import { download } from '@chavanrk/react-native-downloader';

const runDownload = async () => {
  const result = await download({
    url: 'https://example.com/file.pdf',
    // fileName: 'custom_name.pdf', // Optional! Auto-detects if missing.
    onProgress: (p) => {
      console.log(`Downloading: ${p}%`);
    },
  });

  if (result.success) {
    console.log('Downloaded successfully to:', result.filePath);
  } else {
    console.error('Download failed:', result.error);
  }
};
```

---

## ⚡ Growth Strategy (Real Talk)

To make this package successful, ensure you:

1. **Add a Demo GIF:** Include a high-quality GIF of a progress bar here.
2. **Post on:**
   - Reddit (`r/reactnative` & `r/reactjs`)
   - Twitter & LinkedIn
3. **GitHub Title:** “Stop rewriting file download logic in React Native”
4. **Simply be better:** “Do one thing better than everyone else.” This package focuses explicitly on taking the headache out of downloading headers, arrays, and progress loops.

---

## 🔥 Future v2 Ideas

- Background downloads (app closed/suspended)
- Pause / resume controls
- Parallel concurrent downloads
- Expanded local Cache management API

---

_Made natively for the community 🤝_
