/**
 * @file Kopiert alle für die App benötigten Dateien, welche nicht verarbeitet werden müssen
 * @author Eric Biller
 * @version v1.0.0
 * @exports copyFiles
 * @requires gulp
 * @requires del
 */

//Importieren benötigter Module
const del = require("del");
const { src, dest, series, parallel } = require("gulp");

//Kopieren der Fonts
/**
 * Kopiert die Font Dateien ins Dist Verzeichnis
 * @returns stream
 */
function copyFonts() {
  return src("app/fonts/**/*").pipe(dest("dist/fonts"));
}

/**
 * Kopiert die HTML Dateien ins Dist Verzeichnis
 * @returns stream
 */
function copyHtml() {
  return src("app/html/**/*").pipe(dest("dist/html"));
}

/**
 * Kopiert die sitemap.xml, falls vorhanden, ins Dist Verzeichnis
 * @returns stream
 */
function copySitemap() {
  return src("app/sitemap.xml", { allowEmpty: true }).pipe(dest("dist"));
}

/**
 * Kopiert die robots.txt, falls vorhanden, ins dist Verzeichnis
 * @returns stream
 */
function copyRobots() {
  return src("app/robots.txt", { allowEmpty: true }).pipe(dest("dist"));
}

/**
 * Kopiert alle favicons ins Dist Verzeichnis
 * @returns stream
 */
function copyFavicon() {
  return src("app/*.+(png|ico|svg)").pipe(dest("dist"));
}

/**
 * Kopiert die site.webmanifest, falls vorhanden, ins Dist Verzeichnis
 * @returns stream
 */
function copySitemanifest() {
  return src("app/site.webmanifest", { allowEmpty: true }).pipe(dest("dist"));
}

/**
 * Löscht das Verzeichnis dist
 * @param Promise
 */
function cleanDist() {
  console.log('Lösche Verzeichnis "dist"...');
  return del("dist");
}

exports.copyFiles = series(
  cleanDist,
  parallel(
    copySitemanifest,
    copyFavicon,
    copyRobots,
    copySitemap,
    copyHtml,
    copyFonts
  )
);
