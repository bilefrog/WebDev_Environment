/**
 * @file gulp-Task tum kompilieren von SASS-Files und hinzufügen von Prefixen
 * @author Eric Biller
 * @version v1.0.0
 * @exports concatScripts
 * @requires gulp
 * @requires sass
 * @requires gulp-sass
 * @requires gulp-autoprefixer
 */

//Benötigte Module und Plugins laden
const { src, dest } = require("gulp");

const sass = require("gulp-sass")(require("sass")); //sass-Compiler und gulp-sass zur Ansteuerung des Compilers
const autoprefixer = require("gulp-autoprefixer"); //Autoprefixer für webkit in CSS

/**
 * Kompilert SASS zu CSS und versieht das CSS mit Prefixen für webkit
 * @returns stream
 */
function generateCSS() {
  return src("app/scss/**/*.scss")
    .pipe(sass())
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(dest("app/css"));
}

//Exportieren der Methode
exports.generateCSS = generateCSS;
