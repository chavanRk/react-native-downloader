import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  download(options: Object): Promise<Object>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('Downloader');
