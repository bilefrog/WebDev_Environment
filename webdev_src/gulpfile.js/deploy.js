/**
 * @file Deployment via SSH und SCP oder via rsync.
 * @author Eric Biller
 * @version v1.0.0
 * @exports deploy
 * @requires child_process.exec
 */

//Mittels SSH wird das Zielverzeichnis bereinigt und mittels SCP wird das Verzeichnis auf das Zielsystem kopiert.
//Implementation als alternative zum rsync-deployment, falls rsync nicht zur Verfügung steht
//Bei Nutzung von rsync wird die Defaultkonfiguration von rsync genutzt
//Um den ssh-Key des deployUsers zu verwenden ist ein config-File ~/.ssh/config (chmod 600) nach folgendem Muster zu erzeugen:
//
// Match user = "deployUser"
//   IdentityFile ./Pfad/zum/Identityfile

//Pfad zum Parameterfile
const paramFile = "../secret/deployConfig.js";

//Benötigtes Modul laden
const exec = require("child_process").exec;

/**
 * Laden des ParameterFiles, falls kein File vorhanden, Objekt mit Parametern zurückgeben
 * @returns Objekt
 */
async function setConfig() {
  try {
    return require(paramFile);
  } catch (error) {
    console.log("Kein Konfigurationsfile gefunden. Nutze Werte aus deploy.js");
    return {
      deployMethod: "scp", // Auswahl aus "scp", "rsync" oder "auto"
      hostToDeploy: "www.example.de",
      portAtHost: "22",
      username: "deployUser", // Nutzer mit dem deployed werden soll. Nutzer benötigt Schreibrechte auf das Zielverzeichnis (setfacl -d -m u::rwX,u:deployUser:rwX,o::- DeployDir)
      privateKey: "./secret/id_rsa_deployUser",
      localDir: "./dist/",
      remoteDir: "/pfad/zum/Webroot/",
      testRun: true,
    };
  }
}

/**
 * Prüfen ob 'find' verfügbar ist
 * @returns {Promise} resolve(true) wenn vorhanden, andernfalls resolve(false)
 */
async function findAvailPromise() {
  return new Promise((success, error) => {
    exec("find --version", (error) => {
      if (error === null) {
        success(true);
      } else {
        success(false);
      }
    });
  });
}

/**
 * Prüfen ob 'du' verfügbar ist
 * @returns {Promise} resolve(true) wenn vorhanden, andernfalls resolve(false)
 */
async function duAvailPromise() {
  return new Promise((success, error) => {
    exec("du --version", (error) => {
      if (error === null) {
        success(true);
      } else {
        success(false);
      }
    });
  });
}

/**
 * Prüfen ob 'ssh' verfügbar ist
 * @returns {Promise} resolve(true) wenn vorhanden, andernfalls resolve(false)
 */
async function sshAvailPromise() {
  return new Promise((success, error) => {
    exec("ssh -V", (error) => {
      if (error === null) {
        success(true);
      } else {
        success(false);
      }
    });
  });
}

/**
 * Prüfen ob 'rsync' verfügbar ist
 * @returns {Promise} resolve(true) wenn vorhanden, andernfalls resolve(false)
 */
async function rsyncAvailPromise() {
  return new Promise((success, error) => {
    exec("rsync --version", (error) => {
      if (error === null) {
        success(true);
      } else {
        success(false);
      }
    });
  });
}

/**
 *
 * @returns {object} Enthält Ergebnis der Prüfung der Umgebung
 */
async function checkEnv() {
  if (process.platform === "win32") {
    var env = {
      linux: false,
    };
  } else
    var env = {
      linux: true,
    };

  try {
    env.du = await duAvailPromise();
    env.rsync = await rsyncAvailPromise();
    env.find = await findAvailPromise();
    env.ssh = await sshAvailPromise();
  } catch (error) {}
  return env;
}

/**
 * Führt einen SSH-Connect aus und listet entweder die Dateien die gelöscht werden (testRun) oder löscht alle Dateien im remoteDir
 * @returns Promise
 * @requires deployParams.remoteDir
 * @version v1.0.0
 * @since v1.0.0
 */
function sshPromise(deployParams) {
  return new Promise((success, error) => {
    if (deployParams.remoteDir[deployParams.remoteDir.length - 1] === "/") {
      //Zusammenbauen der SSH-Befehle

      //Basis-Connect-Befehl
      const cmdSsh =
        "ssh " +
        deployParams.username +
        "@" +
        deployParams.hostToDeploy +
        " -i " +
        deployParams.privateKey +
        " -p " +
        deployParams.portAtHost +
        " -tt ";

      if (deployParams.testRun === true) {
        // Zweig mit Testlauf

        const cmdListRemote = '"find ' + deployParams.remoteDir + '"';

        exec(cmdSsh + cmdListRemote, function (err, stdout, stderr) {
          if (err === null) {
            console.log("Folgende Dateien würden gelöscht:");
            console.log(stdout);
            success("ssh Kommando ohne Fehler ausgeführt");
          } else {
            error(err);
          }
        });
      } else {
        // of if testrun === true
        // Kein Testlauf! Scharfer Durchgang
        // Auszuführendes Kommando auf dem Zielsystem: Lösche alle Filenodes im remoteDir
        const cmdClearRemote = '"rm -rfv ' + deployParams.remoteDir + '*"';

        //console.log("Der Befehl wird ausgeführt: " + cmdSsh + cmdClearRemote);
        exec(cmdSsh + cmdClearRemote, function (err, stdout, stderr) {
          if (err === null) {
            console.log(
              "Inhalt von " +
                deployParams.hostToDeploy +
                ":" +
                deployParams.remoteDir +
                " wird gelöscht..."
            );
            console.log(stdout);
            success("SSH Kommando ohne Fehler ausgeführt");
          } else {
            // of if err === null
            error("SSH Fehler: " + err);
          }
        });
      }
    } else {
      // falls deployParams.deployDir nicht auf / endet
      error(
        "Zielverzeichnis " + deployParams.remoteDir + ' endet nicht auf "/"'
      );
    }
  });
}

/**
 * Listet alle zu kopierenden Dateien (testRun) auf oder kopiert alle Dateien aus dem localDir ins remoteDir via SCP
 * @returns Promise
 * @requires deployParams
 * @version v1.0.0
 * @since v1.0.0
 */
function scpPromise(deployParams, env) {
  return new Promise((success, error) => {
    if (deployParams.testRun === true) {
      // Zweig für Testrun
      // Zusammenbauen des Befehls zum Auflisten der lokalen Dateien
      if (env.find === true && env.du === true) {
        const cmdListLocal =
          "find " +
          deployParams.localDir +
          " -print0 | du -bcah --files0-from=-";

        exec(cmdListLocal, function (err, stdout, stderr) {
          if (err === null) {
            console.log(
              "Folgende Daten würden von " +
                deployParams.localDir +
                " nach " +
                deployParams.hostToDeploy +
                ":" +
                deployParams.remoteDir +
                " kopiert werden:"
            );
            console.log(stdout);
            success("Listing erfolgreich");
          } else {
            error(err);
          }
        });
      } else {
        success("Kann kein Listing ausgeben. find und/oder du nicht verfügbar");
      }
    } else {
      //Zweig für scharfen Durchgang
      //Zusammenbauen des SCP-Befehls
      let cmdScp =
        "scp -r -i " +
        deployParams.privateKey +
        " -P " +
        deployParams.portAtHost +
        " " +
        deployParams.localDir +
        "* " +
        deployParams.username +
        "@" +
        deployParams.hostToDeploy +
        ":" +
        deployParams.remoteDir;
      if (env.linux === true) {
        cmdScp += " > /dev/tty";
      }

      console.log(
        "Kopiere " +
          deployParams.localDir +
          " nach " +
          deployParams.hostToDeploy +
          ":" +
          deployParams.remoteDir +
          "..."
      );
      exec(cmdScp, function (err, stdout, stderr) {
        if (err === null) {
          console.log(stdout);
          success("Kopiervorgang ohne Fehler beendet");
        } else {
          error(err);
        }
      });
    }
  });
}

/**
 * Führt einen Synchonisierungsvorgang von localDir nach remoteDir mittels rsync durch.
 * @returns Promise
 * @requires deployParams
 */
function rsyncPromise(deployParams) {
  return new Promise((success, error) => {
    //Zusammenbauen des rsync-Kommandos
    //r:recursive, v:verbose, z:compressed, force:lösche nicht-leere Ordner im Ziel, del: lösche extra files im Ziel,
    let cmdRsync =
      "rsync -rvz --force --del " +
      deployParams.localDir +
      " " +
      deployParams.username +
      "@" +
      deployParams.hostToDeploy +
      ":" +
      deployParams.remoteDir;

    if (deployParams.testRun === true) {
      cmdRsync += " --dry-run";
    }

    exec(cmdRsync, function (err, stdout, stderr) {
      if (err === null) {
        console.log(
          "Synchronisiere " +
            deployParams.remoteDir +
            " mit " +
            deployParams.localDir +
            "..."
        );
        console.log(stdout);
        success("rsync ohne Fehler ausgeführt");
      } else {
        error(err);
      }
    });
  });
}

/**
 * Führt den Kopiervorgang von localDir nach remoteDir in Abgängigkeit der gewählten deployMethode durch
 * @param {*} cb Callback zur Signalisierung des erfolgten Durchlaufs
 * @requires deployParams
 * @requires sshPromise
 * @requires scpPromise
 * @requires rsyncPromise
 */
async function deploy(cb) {
  let deployParams = await setConfig();
  if (deployParams.deployMethod === "auto") {
    try {
      env = await checkEnv();
    } catch (error) {}
    if (env.ssh === true) {
      deployParams.deployMethod = "ssh";
    }
    if (env.rsync === true) {
      deployParams.deployMethod = "rsync";
    }
    console.log(
      "deployMethod auf auto 'auto' gesetzt. Ausgewählte Methode: " +
        deployParams.deployMethod
    );
  }
  if (deployParams.deployMethod === "scp") {
    try {
      const ergebnisSsh = await sshPromise(deployParams, env);
      console.log(ergebnisSsh);
      const ergebnisScp = await scpPromise(deployParams, env);
      console.log(ergebnisScp);
    } catch (error) {
      console.log("Fehler bei der Ausführung: " + error);
    }
  }
  if (deployParams.deployMethod === "rsync") {
    try {
      const ergebnisRsync = await rsyncPromise(deployParams);
      console.log(ergebnisRsync);
    } catch (error) {
      console.log("Fehler bei der Ausführung: " + error);
    }
  }
  if (
    deployParams.deployMethod !== "scp" &&
    deployParams.deployMethod !== "rsync"
  ) {
    if (deployParams.deployMethod === "auto") {
      console.log(
        "Deployment nicht durchgeführt. Deploymentmethode konnte nicht ermittelt werden!"
      );
    } else {
      console.log(
        'Deployment nicht durchgeführt. Deploymentmethode "' +
          deployParams.deployMethod +
          '" entspricht nicht "scp", "rsync" oder "auto"'
      );
    }
  }
  cb();
}

exports.deploy = deploy;
