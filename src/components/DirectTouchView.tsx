import { NativeModules, Platform } from 'react-native';

const { DirectTouchModule } = NativeModules;

/**
 * 在 iOS 上设置 UIAccessibilityTraitAllowsDirectInteraction，
 * 使 VoiceOver 将触摸事件直接传递给视图而不拦截。
 * 通过 testID 查找对应的原生视图。
 */
export function enableDirectTouch(testID: string) {
  if (Platform.OS === 'ios' && DirectTouchModule) {
    DirectTouchModule.enableDirectTouch(testID);
  }
}

export function disableDirectTouch(testID: string) {
  if (Platform.OS === 'ios' && DirectTouchModule) {
    DirectTouchModule.disableDirectTouch(testID);
  }
}
