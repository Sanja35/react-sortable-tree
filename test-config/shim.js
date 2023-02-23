global.requestAnimationFrame = callback => {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  setTimeout(callback, 0);
};
