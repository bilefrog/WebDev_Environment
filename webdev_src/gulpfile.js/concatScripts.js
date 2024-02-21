/**
 * @file gulp-Task zum concatieren von JS und CSS inklusive minify
 * @author Eric Biller
 * @version v1.0.0
 * @exports concatScripts
 */

// Benötigte Plugins und Module laden
const { src, pipe, dest } = require("gulp");

const useref = require("gulp-useref"); //Concat Scripts in HTML
const terser = require("gulp-terser"); //Minify JS
const cleancss = require("gulp-clean-css"); //Minify CSS
const gulpif = require("gulp-if"); //IF-Abfrage

/**
 * Konkatiert JS und CSS Skripte und minifiziert diese. Ersetzt die Referenzen in den HTML Dokumenten
 * @returns stream
 * @version v1.0.0
 * @since v1.0.0
 */
function concatScripts() {
  return src("app/*.html")
    .pipe(useref()) // Zusammenfassen der JS/CSS Dateien
    .pipe(gulpif("*.js", terser())) // Minifizieren, wenn es eine *.js-Datei ist
    .pipe(gulpif("*.css", cleancss())) //Minifizieren, wenn es eine *.css-Datei ist
    .pipe(dest("dist"));
}

//Methode exportieren
exports.concatScripts = concatScripts;
