// To get rid of the warning
// Warning: React depends on requestAnimationFrame.
// Make sure that you load a polyfill in older browsers.
module.exports = {
  raf: (global.requestAnimationFrame = cb => setTimeout(cb, 0)),
};
