module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      ["module:react-native-dotenv",
        {
          moduleName: "@env",
          path: ".env",
          allowUndefined: true,
        }
      ], // plugin para usar .env
      "react-native-reanimated/plugin", // deve vir por último
    ],
  };
};
