#!/bin/bash
# Installationsscript für WebDev-Umgebung
# Author: Eric Biller
# Version: v1.0.0

#Prüfen ob Update oder Installationsvorgang
if [ -e ./gulpfile.js ] 
  then
    methode=update
  else
    methode=install
fi

#Installation der Umgebung durchführen
if [ $methode = 'install' ]
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
    cp -r ./src/app ./

    #gulpfile.js-Verzeichnis erstellen
    if [ -e ./gulpfile.js ] 
      then
        mkdir -p ./install.backup
        mv ./gulpfile.js ./install.backup/
    fi #Ende von if -e ./gulpfile.js
    echo "Erstelle Verzeichnis ./gulpfile.js ..."
    cp -r ./src/gulpfile.js ./

    #.browserlistrc erstellen
    if [ -e ./.browserslistrc ] 
      then
        mkdir -p ./install.backup
        mv ./.browserslistrc ./install.backup/
    fi #Ende von if -e ./.browserslistrc
    echo "Erstelle Datei ./.browserslistrc ..."
    cp -r ./src/.browserslistrc ./

    #.gitignore erstellen
    if [ -e ./.gitignore ] 
      then
        mkdir -p ./install.backup
        mv ./.gitignore  ./install.backup/
    fi #Ende von if -e ./.gitignore
    echo "Erstelle Datei ./.gitignore  ..."
    cp -r ./src/.gitignore ./

    #.vscode erstellen
    if [ -e ./.vscode ] 
      then
        mkdir -p ./install.backup
        mv ./.vscode  ./install.backup/
    fi #Ende von if -e ./.vscode
    echo "Erstelle Datei ./.vscode  ..."
    cp -r ./src/.vscode ./

    #.gitignore erstellen
    if [ -e ./.gitignore ] 
      then
        mkdir -p ./install.backup
        mv ./.gitignore  ./install.backup/
    fi #Ende von if -e ./.gitignore
    echo "Erstelle Datei ./.gitignore  ..."
    cp -r ./src/.gitignore ./

    #package-lock.json erstellen
    if [ -e ./package-lock.json ] 
      then
        mkdir -p ./install.backup
        mv ./package-lock.json  ./install.backup/
    fi #Ende von if -e ./package-lock.json
    echo "Erstelle Datei ./package-lock.json  ..."
    cp -r ./src/package-lock.json ./
    
    #package.json erstellen
    if [ -e ./package.json ] 
      then
        mkdir -p ./install.backup
        mv ./package.json  ./install.backup/
    fi #Ende von if -e ./.gitignore
    echo "Erstelle Datei ./package.json  ..."
    cp -r ./src/package.json ./

    #secret/deployConfig.js.example erstellen
    if [ -e ./secret/deployConfig.js.example ] 
      then
        mkdir -p ./install.backup
        mv ./secret/deployConfig.js.example  ./install.backup/
    fi #Ende von if -e ./.gitignore
    echo "Erstelle Datei ./secret/deployConfig.js.example  ..."
    mkdir -p ./secret
    cp -r ./src/secret/deployConfig.js.example ./secret/

    #backup-Verzeichnis zu .gitignore hinzufügen
    if [ -e ./install.backup ]
      then
        echo "Füge ./install.backup zu .gitignore hinzu..."
        echo "install.backup" >> ./.gitignore
    fi

    #NodeJS Pakete installieren
    echo "Installiere NodeJS Pakete mittels npm..."
    npm install

    #git initialisieren
    if [ ! -e ./.git ]
      then
        echo "Git initialisieren..."
        git init
    fi

    echo "Installation beendet!"
fi


