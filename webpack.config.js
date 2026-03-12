const fs = require("fs");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const RemoveEmptyScriptsPlugin = require("webpack-remove-empty-scripts");

const scssFiles = fs.readdirSync("./src/css/sections").filter(function (file) {
  return file.match(/.*\.scss$/);
});

const scssEntries = scssFiles.map((filename) => {
  const filenameWithoutExtension = filename.replace(/\.[^/.]+$/, "");

  const entryName = `section-` + filenameWithoutExtension;

  return { [entryName]: "./src/css/sections/" + filename };
});

module.exports = {
  devtool: "source-map",
  entry: {
    app: "./src/js/app.js",

    ...Object.assign({}, ...scssEntries),
  },
  output: {
    path: path.resolve(__dirname, "assets"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          { loader: "css-loader" },
          { loader: "postcss-loader" },
          {
            // First we transform SASS to standard CSS
            loader: "sass-loader",
            options: {
              implementation: require("sass"),
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new RemoveEmptyScriptsPlugin(),
    new MiniCssExtractPlugin(
      {
        filename: "bundle.[name].css",
      },
      {
        reload: false,
      }
    ),
  ],
  mode: "development",
};
