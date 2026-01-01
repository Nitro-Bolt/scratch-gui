export default async function ({ addon }) {
  if (navigator.vibrate) {
    const originalVibrate = navigator.vibrate;
    navigator.vibrate = function (...args) {
      if (addon.self.disabled) {
        return originalVibrate.call(this, ...args);
      }
      return false;
    };
  }

  if (typeof GamepadHapticActuator === 'function' && typeof GamepadHapticActuator.prototype.pulse === 'function') {
    const originalPulse = GamepadHapticActuator.prototype.pulse;
    GamepadHapticActuator.prototype.pulse = function (...args) {
      if (addon.self.disabled) {
        return originalPulse.call(this, ...args);
      }
      return Promise.resolve(false);
    };
  }

  if (typeof GamepadHapticActuator === 'function' && typeof GamepadHapticActuator.prototype.playEffect === 'function') {
    const originalPlayEffect = GamepadHapticActuator.prototype.playEffect;
    GamepadHapticActuator.prototype.playEffect = function (...args) {
      if (addon.self.disabled) {
        return originalPlayEffect.call(this, ...args);
      }
      return Promise.resolve('preempted');
    };
  }
}
