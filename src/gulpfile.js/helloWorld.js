/**
 * @file Gibt Hello World aus
 * @author Eric Biller
 * @version v1.0.0
 * @exports helloWorld
 */

/**
 * Ausgabe von Hello World
 * @param {callback} cb
 * @version v1.0.0
 * @since v1.0.0
 */
function helloWorld(cb) {
  console.log("Hello World");
  cb();
}

//Exportieren der Methode
exports.helloWorld = helloWorld;
