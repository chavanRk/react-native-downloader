package com.downloader

import com.facebook.react.bridge.ReactApplicationContext

class DownloaderModule(reactContext: ReactApplicationContext) :
  NativeDownloaderSpec(reactContext) {

  override fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  companion object {
    const val NAME = NativeDownloaderSpec.NAME
  }
}
