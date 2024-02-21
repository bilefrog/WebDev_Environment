/**
 * @file Überwacht SASS-Files und ruft generateCSS bei Änderungen auf
 * @author Eric Biller
 * @version v1.0.0
 * @exports watchFiles
 * @requires generateCSS
 * @requires gulp/watch
 */

//Laden der Module
const { watch } = require("gulp");
const { generateCSS } = require("./generateCSS");

//
/**
 * CSS-Dateien auf Änderungen überwachen. Falls eine Änderung eintritt, generateCSS ausführen
 * @param {callback} cb
 * @version v1.0.0
 * @since v1.0.0
 * @requires generateCSS.generateCSS
 * @requires gulp.watch
 */
function watchFiles(cb) {
  watch("app/scss/**/*.scss", generateCSS);
  cb();
}

//Exportieren der Methode
exports.watch = watchFiles;
