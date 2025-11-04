/**
 * 音效管理工具类（简化版）
 * 由于原生库链接问题，暂时使用震动反馈代替音效
 *
 * TODO: 未来可以考虑以下替代方案：
 * 1. 使用 Expo Audio 库 (需要迁移到 Expo)
 * 2. 创建原生模块播放系统提示音
 * 3. 使用 HTML5 Audio (通过 WebView)
 */
class SoundHelper {
  private static initialized = false;

  /**
   * 初始化音效
   * 在应用启动时调用一次
   */
  static initialize(): void {
    if (this.initialized) {
      return;
    }

    console.log('SoundHelper initialized (using vibration only)');
    this.initialized = true;
  }

  /**
   * 播放成功音效
   * 当前通过震动反馈实现
   */
  static playSuccess(): void {
    // 成功反馈已经在 StrokeCanvas 中通过震动实现
    // 短促的震动模拟"叮"的效果
    console.log('Success feedback (via vibration)');
  }

  /**
   * 播放错误音效
   * 当前通过震动反馈实现
   */
  static playError(): void {
    // 错误反馈已经在 StrokeCanvas 中通过震动模式实现
    // 两次短促震动模拟"滋滋"的效果
    console.log('Error feedback (via vibration)');
  }

  /**
   * 释放音效资源
   * 在应用退出时调用
   */
  static release(): void {
    console.log('SoundHelper released');
    this.initialized = false;
  }
}

export default SoundHelper;
