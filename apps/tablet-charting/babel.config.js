module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Reanimated plugin removed - handled by babel-preset-expo in Expo projects
  };
};
