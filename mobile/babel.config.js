module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // react-native-reanimated 4 uchun worklets plagini — OXIRGI plagin bo'lishi shart
    plugins: ["react-native-worklets/plugin"],
  };
};
