module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      ["module:react-native-dotenv"], // plugin para usar .env
      "react-native-reanimated/plugin", // deve vir por último
    ],
  };
};
