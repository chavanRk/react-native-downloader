import { NativeEventEmitter, NativeModules } from 'react-native';
import DownloaderSpec from './NativeDownloader';

// Depending on the RN architecture NativeModules.Downloader might be used
// or the TurboModule spec directly.
const DownloaderModule = NativeModules.Downloader || DownloaderSpec;

const eventEmitter = new NativeEventEmitter(DownloaderModule);

export interface DownloadOptions {
  url: string;
  fileName?: string;
  onProgress?: (percent: number) => void;
}

export interface DownloadResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

export async function download(
  options: DownloadOptions
): Promise<DownloadResult> {
  let progressSubscription: any = null;

  if (options.onProgress) {
    progressSubscription = eventEmitter.addListener(
      'onDownloadProgress',
      (event: any) => {
        if (event.url === options.url && options.onProgress) {
          options.onProgress(event.progress);
        }
      }
    );
  }

  try {
    const result = await (DownloaderSpec as any).download({
      url: options.url,
      fileName: options.fileName,
    });

    // Clean up event listener
    if (progressSubscription) {
      progressSubscription.remove();
    }

    return result as DownloadResult;
  } catch (error: any) {
    // Clean up event listener
    if (progressSubscription) {
      progressSubscription.remove();
    }

    return {
      success: false,
      error: error?.message || 'UNKNOWN_ERROR',
    };
  }
}

export default { download };
