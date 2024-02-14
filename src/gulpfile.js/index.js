/**
 * @file Gulp-Index-File für WebDev
 * @author Eric Biller
 * @version v1.0.0
 * @exports watch
 * @exports generateCSS
 * @exports concatScripts
 * @exports optimizeImages
 * @requires gulp
 * @requires helloWorld
 * @requires generateCSS
 * @requires watch
 * @requires concatScripts
 * @requires optimizeImages
 * @requires copyFiles
 */

//Importieren von benötigten Funktionen aus gulp
const { series, parallel } = require("gulp");

//Importieren der Methoden für die Tasks
const { helloWorld } = require("./helloWorld");
const { generateCSS } = require("./generateCSS");
const { watch } = require("./watch");
const { concatScripts } = require("./concatScripts");
const { optimizeImages } = require("./optimizeImages");
const { copyFiles } = require("./copyFiles");
const { deploy } = require("./deploy");
const { buildPackage } = require("./buildPackage");

//Öffentliche Gulp-Tasks exportieren
exports.hello = helloWorld;
exports.watch = watch;

exports.generateCSS = generateCSS;
exports.concatScripts = concatScripts;
exports.optimizeImages = optimizeImages;
exports.copyFiles = copyFiles;

//Pipelines
exports.build = series(
  copyFiles,
  generateCSS,
  parallel(concatScripts, optimizeImages)
);

exports.deploy = deploy;

exports.buildPackage = buildPackage;
