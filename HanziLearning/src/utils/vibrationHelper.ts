/**
 * 震动权限检查工具
 */
export class VibrationHelper {
  private static isAvailable: boolean | null = null;

  /**
   * 检查震动功能是否可用
   */
  static async checkVibrationAvailable(): Promise<boolean> {
    if (this.isAvailable !== null) {
      return this.isAvailable;
    }

    try {
      const { Vibration } = require('react-native');
      
      // 测试一个极短的震动来检查功能是否可用
      Vibration.vibrate(1);
      this.isAvailable = true;
      return true;
    } catch (error) {
      console.warn('震动功能不可用:', error);
      this.isAvailable = false;
      return false;
    }
  }

  /**
   * 安全的震动调用
   */
  static async safeVibrate(
    pattern: number | number[] = 400,
    repeat?: boolean
  ): Promise<boolean> {
    try {
      const isAvailable = await this.checkVibrationAvailable();
      if (!isAvailable) {
        return false;
      }

      const { Vibration } = require('react-native');
      
      if (Array.isArray(pattern)) {
        Vibration.vibrate(pattern, repeat);
      } else {
        Vibration.vibrate(pattern);
      }
      
      return true;
    } catch (error) {
      console.warn('震动失败:', error);
      return false;
    }
  }

  /**
   * 重置可用性缓存
   */
  static resetAvailabilityCache(): void {
    this.isAvailable = null;
  }
}
