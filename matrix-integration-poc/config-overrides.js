const {
  override,
  useBabelRc,
  addWebpackAlias,
  addDecoratorsLegacy,
  addPostcssPlugins,
} = require("customize-cra");
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
const sassRegex = /\.(scss|sass)$/;

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

const updateSassRule = (rules) => {
  const ruleBundle = rules.find((r) => r.oneOf);
  const rule = ruleBundle.oneOf.find((r) => {
    if (Array.isArray(r.test)) {
      return false;
    }

    return String(r.test) === String(sassRegex);
  });
  rule.use = [
    ...rule.use,
    {
      loader: "postcss-loader",
      ident: "postcss",
      options: {
        sourceMap: true,
        plugins: [
          // Note that we use slightly different plugins for SCSS.
        ],
        parser: "postcss-scss",
        "local-plugins": true,
      },
    },
  ];

  console.log(rule.use);
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
    rules.push({
      // Fix up the name of the opus-recorder worker (react-sdk dependency).
      // We more or less just want it to be clear it's for opus and not something else.
      test: /encoderWorker\.min\.js$/,
      loader: "file-loader",
      type: "javascript/auto", // https://github.com/webpack/webpack/issues/6725
      options: {
        // We deliberately override the name so it makes sense in debugging
        name: "opus-encoderWorker.min.[hash:7].[ext]",
        outputPath: ".",
      },
    });

    updateTsRule(rules);
    // updateSassRule(rules);

    // config.entry = {
    //   ...config.entry,
    //   // "indexeddb-worker": "./src/indexeddb-worker.js",
    // };

    const noParse = [
      // for cross platform compatibility use [\\\/] as the path separator
      // this ensures that the regex trips on both Windows and *nix

      // don't parse the languages within highlight.js. They cause stack
      // overflows (https://github.com/webpack/webpack/issues/1721), and
      // there is no need for webpack to parse them - they can just be
      // included as-is.
      /highlight\.js[\\\/]lib[\\\/]languages/,

      // olm takes ages for webpack to process, and it's already heavily
      // optimised, so there is little to gain by us uglifying it.
      /olm[\\\/](javascript[\\\/])?olm\.js$/,
    ];

    config.output = {
      ...config.output,
      path: path.join(__dirname, "build"),
    };

    config.resolve = {
      ...config.resolve,
      mainFields: ["matrix_src_browser", "matrix_src_main", "browser", "main"],
      aliasFields: ["matrix_src_browser", "browser"],
    };

    return Object.assign(config, {
      module: Object.assign(config.module, { noParse, rules }),
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
  // use babel because of features in matrix-react-sdk

  addWebpackAlias({
    "matrix-js-sdk": path.resolve(__dirname, "node_modules/matrix-js-sdk"),
    ["$webapp"]: path.resolve(__dirname, "public"),
  }),

  registerBabelRc(),

  // load wasm files
  addMatrixRules(),

  addDecoratorsLegacy(),

  // ensure that olm legacy could be loaded
  addCopyPlugin(),

  addPostcssPlugins([
    require("postcss-import")(),
    require("postcss-mixins")(),
    require("postcss-simple-vars")(),
    require("postcss-extend")(),
    require("postcss-nested")(),
    require("postcss-easings")(),
    require("postcss-strip-inline-comments")(),
    require("postcss-hexrgba")(),
    require("postcss-calc")({ warnWhenCannotResolve: true }),

    // It's important that this plugin is last otherwise we end
    // up with broken CSS.
    require("postcss-preset-env")({
      stage: 3,
      browsers: "last 2 versions",
    }),
  ])
);
