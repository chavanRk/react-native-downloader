#import "Downloader.h"
#import <Foundation/Foundation.h>
#import <React/RCTLog.h>

@interface Downloader () <NSURLSessionDownloadDelegate>
@property (nonatomic, strong) NSURLSession *session;
@property (nonatomic, strong) NSMutableDictionary *activePromises;
@property (nonatomic, strong) NSMutableDictionary *downloadOptions;
@end

@implementation Downloader

RCT_EXPORT_MODULE()

- (instancetype)init {
    if (self = [super init]) {
        self.activePromises = [NSMutableDictionary new];
        self.downloadOptions = [NSMutableDictionary new];
        NSURLSessionConfiguration *config = [NSURLSessionConfiguration defaultSessionConfiguration];
        self.session = [NSURLSession sessionWithConfiguration:config delegate:self delegateQueue:nil];
    }
    return self;
}

- (NSArray<NSString *> *)supportedEvents {
    return @[@"onDownloadProgress"];
}

- (void)download:(NSDictionary *)options resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    NSString *urlString = options[@"url"];
    if (!urlString) {
        resolve(@{@"success": @NO, @"error": @"URL is missing"});
        return;
    }
    
    NSURL *url = [NSURL URLWithString:urlString];
    NSURLSessionDownloadTask *task = [self.session downloadTaskWithURL:url];
    NSString *taskId = [NSString stringWithFormat:@"%lu", (unsigned long)task.taskIdentifier];
    
    self.activePromises[taskId] = @{@"resolve": resolve, @"reject": reject};
    self.downloadOptions[taskId] = options;
    
    [task resume];
}

- (void)URLSession:(NSURLSession *)session downloadTask:(NSURLSessionDownloadTask *)downloadTask didWriteData:(int64_t)bytesWritten totalBytesWritten:(int64_t)totalBytesWritten totalBytesExpectedToWrite:(int64_t)totalBytesExpectedToWrite {
    if (totalBytesExpectedToWrite > 0) {
        int progress = (int)((totalBytesWritten * 100) / totalBytesExpectedToWrite);
        NSString *url = downloadTask.originalRequest.URL.absoluteString;
        
        [self sendEventWithName:@"onDownloadProgress"
                           body:@{@"url": url ?: @"", @"progress": @(progress)}];
    }
}

- (void)URLSession:(NSURLSession *)session downloadTask:(NSURLSessionDownloadTask *)downloadTask didFinishDownloadingToURL:(NSURL *)location {
    NSString *taskId = [NSString stringWithFormat:@"%lu", (unsigned long)downloadTask.taskIdentifier];
    NSDictionary *funcs = self.activePromises[taskId];
    NSDictionary *options = self.downloadOptions[taskId];
    
    if (funcs) {
        RCTPromiseResolveBlock resolve = funcs[@"resolve"];
        NSString *fileName = options[@"fileName"];
        if (!fileName) {
            fileName = downloadTask.originalRequest.URL.lastPathComponent;
        }
        if (!fileName || [fileName isEqualToString:@""]) {
            fileName = @"downloaded_file";
        }
        
        NSURL *cacheDir = [[NSFileManager defaultManager] URLsForDirectory:NSCachesDirectory inDomains:NSUserDomainMask].firstObject;
        NSURL *destURL = [cacheDir URLByAppendingPathComponent:fileName];
        
        NSError *error = nil;
        [[NSFileManager defaultManager] removeItemAtURL:destURL error:nil]; // remove if exists
        [[NSFileManager defaultManager] moveItemAtURL:location toURL:destURL error:&error];
        
        if (error) {
            resolve(@{@"success": @NO, @"error": error.localizedDescription});
        } else {
            resolve(@{@"success": @YES, @"filePath": destURL.path});
        }
        
        [self.activePromises removeObjectForKey:taskId];
        [self.downloadOptions removeObjectForKey:taskId];
    }
}

- (void)URLSession:(NSURLSession *)session task:(NSURLSessionTask *)task didCompleteWithError:(NSError *)error {
    if (error) {
        NSString *taskId = [NSString stringWithFormat:@"%lu", (unsigned long)task.taskIdentifier];
        NSDictionary *funcs = self.activePromises[taskId];
        if (funcs) {
            RCTPromiseResolveBlock resolve = funcs[@"resolve"];
            resolve(@{@"success": @NO, @"error": error.localizedDescription});
            [self.activePromises removeObjectForKey:taskId];
            [self.downloadOptions removeObjectForKey:taskId];
        }
    }
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeDownloaderSpecJSI>(params);
}

+ (NSString *)moduleName
{
  return @"Downloader";
}

@end
