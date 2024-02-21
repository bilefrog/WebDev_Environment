#!/bin/bash
# Installationsscript für WebDev-Umgebung
# Author: Eric Biller
# Version: v1.0.2

#Benötigte NodeJS-Pakete für die Umgebung

pakete="del flat-map fs gulp gulp-autoprefixer gulp-cache gulp-clean-css gulp-if gulp-imagemin gulp-sass gulp-scale-images gulp-terser gulp-useref gulp-util path sass through2"

#Prüfen ob Update oder Installationsvorgang
if [ -e ./gulpfile.js ] 
  then
    methode=update
  else
    methode=install
fi

#Definition der Funktionen
function pruefeGitignore () {
  
  schreibeZeile=""
  
  while read neueZeile; do
    treffer=nein

    while read gitZeile; do 
      if [ "$neueZeile" = "$gitZeile" ]
      then
        treffer=ja
      fi
    done < ./.gitignore
    
    if [ "$treffer" = 'nein' ]
    then 
      schreibeZeile+="$neueZeile\n"
      echo $schreibeZeile
    fi

  done < ./webdev_src/.gitignore
  echo -e $schreibeZeile >> .gitignore
}

function copyFiles {

  #gulpfile.js installieren
  if [ -e ./gulpfile.js ] 
      then
        mkdir -p ./install.backup
        mv ./gulpfile.js ./install.backup/
    fi #Ende von if -e ./gulpfile.js
    echo "Erstelle Verzeichnis ./gulpfile.js ..."
    cp -r ./webdev_src/gulpfile.js ./

  #.browserlistrc installieren
  if [ -e ./.browserslistrc ] 
      then
        mkdir -p ./install.backup
        mv ./.browserslistrc ./install.backup/
    fi #Ende von if -e ./.browserslistrc
    echo "Erstelle Datei ./.browserslistrc ..."
    cp -r ./webdev_src/.browserslistrc ./

  #.vscode erstellen
  if [ -e ./.vscode ] 
    then
      mkdir -p ./install.backup
      mv ./.vscode  ./install.backup/
  fi #Ende von if -e ./.vscode
  echo "Erstelle Datei ./.vscode  ..."
  cp -r ./webdev_src/.vscode ./

  #secret/deployConfig.js.example erstellen
  if [ -e ./secret/deployConfig.js.example ] 
    then
      mkdir -p ./install.backup
      mv ./secret/deployConfig.js.example  ./install.backup/
  fi #Ende von if -e ./.gitignore
  echo "Erstelle Datei ./secret/deployConfig.js.example  ..."
  mkdir -p ./secret
  cp -r ./webdev_src/secret/deployConfig.js.example ./secret/

}

function aktualisiereNodejs {

    #NodeJS Pakete installieren
    echo "Installiere folgende NodeJS Pakete mittels npm:"
    echo $pakete
    npm install --save-dev $pakete

    #Überflüssige NodeJS Pakete entfernen
    echo "Entferne überflüssige NodeJS Pakete..."
    npm prune

}

#Installation der Umgebung durchführen
if [ "$methode" = 'install' ]
  then
    workdir=`pwd`
    echo "Die WebDev-Umgebung wird installiert. Alle Dateien in diesem Verzeichnis($workdir) können überschrieben werden."
    echo "Die zu löschenden Dateien werden jedoch in $workdir/install.backup/ gesichert."

    #app-Verzeichnis erstellen
    if [ -e ./app ] 
      then
        mkdir -p ./install.backup
        mv ./app ./install.backup/
    fi #Ende von if -e ./app
    echo "Erstelle Verzeichnis ./app ..."
    cp -r ./webdev_src/app ./

    #Kopieren der Dateien
    copyFiles

    #NodeJS Projekt erzeugen
    Echo "Erzeuge neues NodeJS Projekt:"
    npm init

    #NodeJS Pakete aktualisieren
    aktualisiereNodejs

    #.gitignore erstellen
    if [ -e ./.gitignore ] 
     then
       mkdir -p ./install.backup
       mv ./.gitignore  ./install.backup/
    fi #Ende von if -e ./.gitignore
    echo "Erstelle Datei ./.gitignore  ..."
    cp -r ./webdev_src/.gitignore ./

    #git initialisieren
    if [ ! -e ./.git ]
      then
        echo "Git initialisieren..."
        git init
    fi

    echo "Installation beendet!"
fi

if [ "$methode" = 'update' ]
  then
    workdir=`pwd`
    echo "Die WebDev-Umgebung wird aktualisiert. Folgende Dateien in diesem Verzeichnis können überschrieben werden:"
    echo "gulpfiles.js(/), .browserslistrc, .gitignore, .vscode/"
    echo "Diese Dateien werden jedoch in $workdir/install.backup/ gesichert."

    #Kopieren der Dateien
    copyFiles

    #Überprüfen ob gitignore die notwendigen Einträge enthält
    pruefeGitignore

    #Aktualisieren der NodeJS Pakete
    aktualisiereNodejs

    echo "Update beendet"
fi



