module.exports = {
  "presets": [
    ["@babel/preset-env", {
      "modules": false,
    }]
  ],
  "plugins": [
    [
      "babel-plugin-component",
      {
        "libraryName": "element-ui",
        // "styleLibraryName": "theme-chalk",
        "style": false,
      }
    ],
  ],
};