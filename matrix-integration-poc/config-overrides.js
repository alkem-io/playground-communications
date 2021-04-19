const { override, useBabelRc, addWebpackAlias } = require("customize-cra");
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

const registerBabelRc = useBabelRc;
const reactSdkSrcDir = path.resolve(
  require.resolve("matrix-react-sdk/package.json"),
  "..",
  "src"
);
const jsSdkSrcDir = path.resolve(
  require.resolve("matrix-js-sdk/package.json"),
  "..",
  "src"
);

const resolveTargets = ["file.js", "file.ts", "file.tsx", "file.jsx"];

const updateTsRule = (rules) => {
  const ruleBundle = rules.find((r) => r.oneOf);
  const rule = ruleBundle.oneOf.find((r) => {
    if (Array.isArray(r.test)) {
      return false;
    }

    return resolveTargets.every((t) => r.test && r.test.test(t));
  });
  rule.include = (f) => {
    if (f.startsWith(path.resolve(__dirname, "src"))) return true;

    // need to add the matrix src directories as well...
    if (f.startsWith(reactSdkSrcDir) || f.startsWith(jsSdkSrcDir)) {
      return true;
    }
  };
};

const addMatrixRules = () =>
  function (config) {
    const rules = config.module?.rules || [];

    rules.push({
      test: /\.wasm$/,
      type: "javascript/auto",
      loader: "file-loader",
      options: {
        name: "[name].[hash:7].[ext]",
        outputPath: ".",
      },
    });
    rules.push({
      test: /\.*languages.json$/,
      type: "javascript/auto",
      loader: "file-loader",
      options: {
        name: "i18n/[name].[hash:7].[ext]",
      },
    });

    updateTsRule(rules);

    config.output = {
      ...config.output,
      path: path.join(__dirname, "build"),
    };

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

console.log(path.resolve(__dirname, "build"));

module.exports = override(
  // use babel because of features in matrix-react-sdk

  addWebpackAlias({
    "matrix-js-sdk": path.resolve(__dirname, "node_modules/matrix-js-sdk"),
    ["$webapp"]: path.resolve(__dirname, "public"),
  }),

  registerBabelRc(),
  
  // load wasm files
  addMatrixRules(),

  // ensure that olm legacy could be loaded
  addCopyPlugin()
);
