'use strict'

const {BrowserWindow} = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer;
const path = require('path');
var UIparameters = {
    'dataset' : null,
    'mutation' : null,
    'crossover' : null,
    'surrogateModel' : null,
    'squareSize' : null,
    'positiveSchemas' : {},
    'negativeSchemas' : {}
}

var Schemas = [];

// Hidden window invocation
var windowID = BrowserWindow.getFocusedWindow().id;
var hiddenPath = `file://${path.join(__dirname, 'hidden.html')}`;
var win = new BrowserWindow({
    width: 1280,
    height: 600,
    show: false
})
win.loadURL( hiddenPath );
//win.webContents.openDevTools();


win.webContents.on('did-finish-load', () => {
    $(document).ready(function () {
        UIparameters.dataset = $("#dataset").val();
        UIparameters.mutation = $("#mutation").val();
        UIparameters.crossover = $("#mutation").val();
        UIparameters.surrogateModel = false;
        UIparameters.squareSize = $('#my-content .vis').first().width();
        //console.log(JSON.stringify(UIparameters))
        win.webContents.send('init-visualisations', JSON.stringify(UIparameters), windowID);
    })
})

$(document).ready(function() {
    $('#my-content .vis').css('height',$('#my-content .vis').first().width());
})

// Hidden window listeners
ipcRenderer.on('show-visualisations', (event, output) => {
    console.log(output);
    $("#my-content .row canvas").remove();
    let schemas = JSON.parse(output);
    $.each(schemas, function (key, val) {
        console.log(key,val);
        $("#my-content .row .col-sm-3:nth-child("+(key+1)+") .vis").each( function(k,elem) {
            vegaEmbed(elem, val);
        })
    })

    $("#nextiteration").removeAttr("disabled");
    $(".vis").removeClass("selectedPositive");
    $(".vis").removeClass("selectedNegative");
    $("#nextiteration").find(".fa").addClass("hidden");
    $("#modalForDisablingEvents").hide();
    UIparameters.positiveSchemas = [];
})

// UI listeners
$(".switch-light span span").on("click", function() {
    if( $(this).text() == "Off") {
        UIparameters.surrogateModel = false;
    } else {
        UIparameters.surrogateModel = true;
    }
})

$("#dataset").on("change", function() {
    if($.data(this, 'current') == undefined) {
        $.data(this, 'current', "Iris");
    }
    if (window.confirm("Are you sure?")) {
        UIparameters.dataset = $(this).val();
        win.webContents.send('init-visualisations', JSON.stringify(UIparameters), windowID);
    } else {
        $(this).val($.data(this, 'current'));
        return false;
    }
    $.data(this, 'current', $(this).val());
})

$("#mutation").on("change input", function() {
    $("#mutation-probability").text( $(this).val() );
    UIparameters.mutation = $(this).val();
})

$("#crossover").on("change input", function() {
    $("#crossover-probability").text( $(this).val() );
    UIparameters.crossover = $(this).val();
})

$(".switch-light span").on("click", function() {
    UIparameters.surrogateModel = !(UIparameters.surrogateModel);
})

$("#nextiteration").on("click", function() {
    if( $(this).attr("disabled") != "disabled" ) {
        if( UIparameters.positiveSchemas.length == 0) {
            alert("No positive schema was chosen");
        } else if(false &&  UIparameters.negativeSchemas.length == 0 ) {
            alert("No negative schema was chosen");
        } else {
            $(this).attr("disabled","disabled");
            $(this).find(".fa").removeClass("hidden");
            $("#modalForDisablingEvents").height(
                $("#my-content").height()
            ).show();
            win.webContents.send('next-visualisations', JSON.stringify(UIparameters), windowID);
        }
    }
})

$(".vis").on({
    "click" : function() {
        $(this).removeClass('selectedNegative');
        if( $(this).hasClass('selectedPositive') ) {
            $(this).removeClass('selectedPositive');
            var vis = this;
            delete UIparameters.positiveSchemas[$(this).attr("data-id")];
            UIparameters.positiveSchemas = UIparameters.positiveSchemas.filter(function(x){
                return (x !== (undefined || null || ''));
            });
        } else {
            $(this).addClass('selectedPositive');
            UIparameters.positiveSchemas[$(this).attr("data-id")] = ($(this).attr("data-id"))
        }
    },
    "contextmenu": function () {
        /*
        $(this).removeClass('selectedPositive');
        if( $(this).hasClass('selectedNegative') ) {
            $(this).removeClass('selectedNegative');
        } else {
            $(this).addClass('selectedNegative');
        }*/
    }
})
