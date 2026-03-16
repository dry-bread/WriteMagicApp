#import <React/RCTBridgeModule.h>
#import <UIKit/UIKit.h>

/**
 * 原生模块：通过 testID (accessibilityIdentifier) 找到对应的 UIView，
 * 并设置/移除 UIAccessibilityTraitAllowsDirectInteraction 特性。
 * 该特性使 VoiceOver 将触摸事件直接传递给视图，而不是拦截为导航手势。
 */
@interface DirectTouchModule : NSObject <RCTBridgeModule>
@end

@implementation DirectTouchModule

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup {
    return NO;
}

- (UIView *)findViewWithIdentifier:(NSString *)identifier inView:(UIView *)view {
    if ([view.accessibilityIdentifier isEqualToString:identifier]) {
        return view;
    }
    for (UIView *subview in view.subviews) {
        UIView *found = [self findViewWithIdentifier:identifier inView:subview];
        if (found) return found;
    }
    return nil;
}

- (UIView *)findViewByTestID:(NSString *)testID {
    for (UIScene *scene in UIApplication.sharedApplication.connectedScenes) {
        if (![scene isKindOfClass:[UIWindowScene class]]) continue;
        UIWindowScene *windowScene = (UIWindowScene *)scene;
        for (UIWindow *window in windowScene.windows) {
            UIView *found = [self findViewWithIdentifier:testID inView:window];
            if (found) return found;
        }
    }
    return nil;
}

RCT_EXPORT_METHOD(enableDirectTouch:(NSString *)testID) {
    dispatch_async(dispatch_get_main_queue(), ^{
        UIView *view = [self findViewByTestID:testID];
        if (view) {
            view.accessibilityTraits |= UIAccessibilityTraitAllowsDirectInteraction;
        }
    });
}

RCT_EXPORT_METHOD(disableDirectTouch:(NSString *)testID) {
    dispatch_async(dispatch_get_main_queue(), ^{
        UIView *view = [self findViewByTestID:testID];
        if (view) {
            view.accessibilityTraits &= ~UIAccessibilityTraitAllowsDirectInteraction;
        }
    });
}

@end
