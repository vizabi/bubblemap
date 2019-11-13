/* eslint-disable no-undef */
const path = require('path');
const meta = require("./package.json");

//const babel = require("rollup-plugin-babel");
const {eslint} = require("rollup-plugin-eslint");
const resolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");
const replace = require("rollup-plugin-replace");
const {terser} = require("rollup-plugin-terser");
const sass = require("rollup-plugin-sass");
const json = require("rollup-plugin-json");
const trash = require("rollup-plugin-delete");
const copy = require("rollup-plugin-copy");

const copyright = `// ${meta.homepage} v${meta.version} Copyright ${(new Date).getFullYear()} ${meta.author.name}`;

module.exports = ((chartName, chartNameLower, dirName, dir) => ({
  input: {
    [chartNameLower || meta.name]: path.resolve(__dirname,'src/index.js')
  },
  output: {
    name: chartName || meta.name,
    dir: (dir || "build"),
    format: "umd",
    banner: copyright,
    sourcemap: true,
    globals: {
      "mobx": "mobx",
      "Vizabi": "Vizabi",
      "VizabiSharedComponents": "VizabiSharedComponents"
    }
  },
  external: ["mobx", "Vizabi", "VizabiSharedComponents"],
  plugins: [
    !dir && trash({
      targets: ['build/*']
    }),
    copy({
      targets: [{
        src: [path.resolve(__dirname,"src/assets")],
        dest: dir || "build"
      }]
    }),
    resolve(),
    (process.env.NODE_ENV === "production" && eslint()),
    // babel({
    //   exclude: "node_modules/**"
    // }),
    commonjs(),
    sass({
      include: path.resolve(__dirname,"src/**/*.scss"),
      output: (dir || "build") + "/" + (chartNameLower || meta.name) + ".css",
    }),
    json(),
    replace({
      ENV: JSON.stringify(process.env.NODE_ENV || "development")
    }),
    (process.env.NODE_ENV === "production" && terser({output: {preamble: copyright}})),
  ]
})).bind(null, 'BubbleMap', 'bubblemap', __dirname);
