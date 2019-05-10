'use strict'

const ipc = require('electron').ipcRenderer;
const BrowserWindow = require('electron').remote.BrowserWindow;
const fs = require('fs');
const $ = require('jquery');
const {GrammarEvolution} = require("./grammar-evolution.js");
const grammar = require("./grammar.js").grammar;
const path = require('path');
var evolution = new GrammarEvolution();


function setAttributes(UIparameters) {
    let dataset = JSON.parse(fs.readFileSync(path.join(__dirname, UIparameters.dataset)));
    let fields = [];
    $.each(Object.keys(UIparameters.chosenColumns), function (key, val) {
        fields.push([val]);
    })
    grammar.Expressions.field = fields;
}


ipc.on('init-visualisations', function (event, jsonString, fromWindowId) {
    let fromWindow = BrowserWindow.fromId(fromWindowId);
    let UIparameters = JSON.parse(jsonString);
    setAttributes(UIparameters);
    let populationSize = 12;
    evolution.initPopulation(populationSize, UIparameters);
    // sem prijde generovani novych schemat
    var data = JSON.parse(fs.readFileSync(path.join(__dirname, UIparameters.dataset)));
    let schemaTemplate = {
        "width": UIparameters.squareSize,
        "height": UIparameters.squareSize,
        "autosize": {
            "type": "fit",
            "contains": "padding"
        },
        "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
        "data": {"values": data},
        "mark" : null,
        "encoding" : null
    };
    let schemas = [];
    for(let i=0; i<populationSize; i++) {
        let individualGene = evolution.getIndividual(i).getGene()
        let deepCopySchema = $.extend(true, {}, schemaTemplate);
        deepCopySchema["mark"] = individualGene["start"]["mark"];
        deepCopySchema["encoding"] = individualGene["start"]["encoding"];
        schemas[i] = deepCopySchema;
    }
    console.log(schemas);
    fromWindow.webContents.send('show-visualisations', JSON.stringify(schemas));
})

ipc.on('next-visualisations', function (event, jsonString, fromWindowId) {
    let fromWindow = BrowserWindow.fromId(fromWindowId);
    let UIparameters = JSON.parse(jsonString);
    evolution.nextPopulation(UIparameters);
    // sem prijde generovani novych schemat
    var data = JSON.parse(fs.readFileSync(path.join(__dirname, UIparameters.dataset)));
    let schemaTemplate = {
        "width": UIparameters.squareSize,
        "height": UIparameters.squareSize,
        "autosize": {
            "type": "fit",
            "contains": "padding"
        },
        "$schema": "https://vega.github.io/schema/vega-lite/v2.json",
        "data": {"values": data},
        "mark" : null,
        "encoding" : null
    }
    let schemas = [];
    for(let i=0; i<evolution.populationSize; i++) {
        let individualGene = evolution.getIndividual(i).getGene();
        let deepCopySchema = $.extend(true, {}, schemaTemplate);
        deepCopySchema["mark"] = individualGene["start"]["mark"];
        deepCopySchema["encoding"] = individualGene["start"]["encoding"];
        schemas[i] = deepCopySchema;
    }
    fromWindow.webContents.send('show-visualisations', JSON.stringify(schemas));
})
