package com.downloader

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

class DownloaderModule(private val reactContext: ReactApplicationContext) :
  NativeDownloaderSpec(reactContext) {

  override fun download(options: ReadableMap, promise: Promise) {
    val urlString = options.getString("url")
    if (urlString == null) {
      promise.reject("ERROR", "URL is missing")
      return
    }

    val fileName = if (options.hasKey("fileName")) options.getString("fileName") else null
    
    thread {
      try {
        val url = URL(urlString)
        val connection = url.openConnection() as HttpURLConnection
        connection.connect()

        if (connection.responseCode != HttpURLConnection.HTTP_OK) {
           val result = Arguments.createMap()
           result.putBoolean("success", false)
           result.putString("error", "SERVER_ERROR")
           promise.resolve(result)
           return@thread
        }

        val fileLength = connection.contentLength
        
        var name = fileName
        if (name == null) {
          name = urlString.substring(urlString.lastIndexOf("/") + 1)
          if (name.contains("?")) name = name.substring(0, name.indexOf("?"))
          if (name.isBlank()) name = "downloaded_file"
        }
        
        val dir = reactContext.cacheDir
        val file = File(dir, name)
        
        val input = connection.inputStream
        val output = FileOutputStream(file)
        
        val data = ByteArray(8192)
        var total: Long = 0
        var count: Int
        var lastProgress = 0
        
        while (input.read(data).also { count = it } != -1) {
          total += count.toLong()
          
          if (fileLength > 0) { 
            val progress = (total * 100 / fileLength).toInt()
            if (progress > lastProgress) {
              lastProgress = progress
              val event = Arguments.createMap()
              event.putString("url", urlString)
              event.putInt("progress", progress)
              reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("onDownloadProgress", event)
            }
          }
          output.write(data, 0, count)
        }
        
        output.flush()
        output.close()
        input.close()
        
        val result = Arguments.createMap()
        result.putBoolean("success", true)
        result.putString("filePath", file.absolutePath)
        promise.resolve(result)
        
      } catch (e: Exception) {
        val err = Arguments.createMap()
        err.putBoolean("success", false)
        err.putString("error", e.message ?: "NETWORK_ERROR")
        promise.resolve(err)
      }
    }
  }

  companion object {
    const val NAME = NativeDownloaderSpec.NAME
  }
}
