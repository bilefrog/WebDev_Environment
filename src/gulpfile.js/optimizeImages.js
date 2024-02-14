/**
 * @file Auflösung von Bildern anpassen und Bilder minifizieren
 * @author Eric Biller
 * @version v1.0.0
 * @exports optimizeImages
 * @requires gulp-scale-images
 * @requires flat-map
 * @requires gulp-scale-images/read-metadata
 * @requires through2
 * @requires gulp-imagemin
 * @requires gulp-cache
 * @requires gulp
 * @todo Erzeugen von mehreren Bildern in verschiedenen Auflösungen
 */

const { src, dest } = require("gulp");

//Benötigte Plugins laden
const scaleImages = require("gulp-scale-images"); //zum Skalieren der Bilder
//const flatMap = require("flat-map").default; //derzeit noch nicht verwendet
const path = require("path"); //Arbeiten mit dem Dateipfad
const readMetadata = require("gulp-scale-images/read-metadata"); //Auslesen von Bildinformationen
const through = require("through2");
const imagemin = require("gulp-imagemin"); //Minifizieren von Bildern
const cache = require("gulp-cache"); //cachen von Dateien

/**
 * Maximale Größe der längsten Bildseite in Pixeln
 * @typedef {number} maxDimension
 */
const maxDimension = 1080;

/**
 * Erzeugen der Scaling-Instructions zur Übergabe an Scale-Images
 * @param {stream} file
 * @param {*} _
 * @param {callback} cb
 * @version v1.0.0
 * @since v1.0.0
 */
const generateScaleInstructions = (file, _, cb) => {
  readMetadata(file, (err, meta) => {
    if (err) return cb(err);
    //File kopieren um am Klon weiterzuarbeiten
    file = file.clone();
    //Wenn Breite die längste Bildseite ist, diese auf maxDimension setzen
    if (meta.height < meta.width) {
      file.scale = {
        maxWidth: maxDimension,
        withoutEnlargement: true,
        metadata: false,
      };
    } else {
      //Wenn Höhe die löngste Bildseite ist, diese auf maxDimension setzen
      file.scale = {
        maxHeight: maxDimension,
        withoutEnlargement: true,
        metadata: false,
      };
    }
    cb(null, file);
  });
};

/**
 * Erzeugen des Dateinamens
 * @param {stream} output
 * @param {object} scale
 * @param {callback} cb
 * @version v1.0.0
 * @since v1.0.0
 */
const generateFileName = (output, scale, cb) => {
  const fileName = [
    path.basename(output.path, output.extname), // Dateiesuffix entfernen
    //scale.maxWidth + "w", // z.B. '1080w' an den Filenamen anhängen
    scale.format || output.extname.substring(1), //den Punkt von der Dateiwerweiterung entfernen
  ].join(".");
  cb(null, fileName);
};

// Test: Noch nicht in Nutzung
// Zwei Dateigrößen erzeugen. ToDo: Dateinamen anhand der Dateigrößen festelegen
/*
const twoSizesPerFile = (file, cb) => {
  const jpgFile = file.clone();
  jpgFile.scale = {
    maxWidth: 1080,
    withoutEnlargement: true,
    metadata: false,
    format: "jpeg",
  };
  const pngFile = file.clone();
  pngFile.scale = {
    maxWidth: 700,
    format: "png",
    withoutEnlargement: true,
    metadata: false,
  };
  // cb(null, [pngFile, jpgFile])
  cb(null, jpgFile);
};
*/

/**
 * Optimiert Bilder für das Web, passt die Auflösung an und minifiziert die Bilder
 * @returns stream
 * @version v1.0.0
 * @since v1.0.0
 */
function optimizeImages() {
  return (
    src("app/images/**/*.+(png|jpg|jpeg)")
      //.pipe(flatMap(twoSizesPerFile))  //für die zwei Größen verwenden
      .pipe(through.obj(generateScaleInstructions))
      .pipe(
        cache(
          //Bilder werden gecached, um nicht immer wieder die gleichen Bilder erneut umzuwandeln
          scaleImages(generateFileName)
        )
      )
      .pipe(cache(imagemin()))
      .pipe(dest("dist/images"))
  );
}

//Exportieren der Methode
exports.optimizeImages = optimizeImages;
