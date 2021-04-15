const { override } = require("customize-cra");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

const addWasmLoader = () =>
  function (config) {
    const rules = config.module?.rules || [];

    rules.push({
      test: /\.wasm$/,
      type: "javascript/auto",
      loaders: ["arraybuffer-loader"],
    });

    return Object.assign(config, {
      module: Object.assign(config.module, { rules }),
    });
  };

const addCopyPlugin = () =>
  function (config) {
    if (!config.plugins) {
      config.plugins = [];
    }

    config.plugins.push(
      new CopyPlugin({
        patterns: [
          { from: path.resolve(__dirname, "node_modules/olm/olm_legacy.js") },
        ],
      })
    );

    return config;
  };

module.exports = override(
  // load wasm files
  addWasmLoader(),

  // ensure that olm legacy could be loaded
  addCopyPlugin()
);
