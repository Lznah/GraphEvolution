'use strict'

const {BrowserWindow} = require('electron').remote;
const fs = require('fs');
const ipcRenderer = require('electron').ipcRenderer;
const path = require('path');
console.log(""); // wtf? Without this, this script is not reloaded
var UIparameters = {
    'dataset' : null,
    'mutation' : null,
    'crossover' : null,
    'squareSize' : null,
    'positiveSchemas' : {},
    'chosenColumns': {},
    'init': false
}

var Schemas = [];

// Hidden window invocation
var windowID = BrowserWindow.getFocusedWindow().id;
var hiddenPath = `file://${path.join(__dirname, 'hidden.html')}`;
var win = new BrowserWindow({
    width: 1280,
    height: 600,
    show: true
})
win.loadURL( hiddenPath );
win.webContents.openDevTools();

win.webContents.on('did-finish-load', () => {
    $(document).ready(function () {
        UIparameters.dataset = $("#dataset").val();
        UIparameters.mutation = $("#mutation").val();
        UIparameters.crossover = $("#mutation").val();
        UIparameters.squareSize = $('#my-content .vis').first().width();
        loadDataset();

        //win.webContents.send('init-visualisations', JSON.stringify(UIparameters), windowID);
    });
})

$(document).ready(function() {
    $('#my-content .vis').css('height',$('#my-content .vis').first().width());
})

// Hidden window listeners
ipcRenderer.on('show-visualisations', (event, output) => {
    $("#my-content .row canvas").remove();
    console.log(JSON.parse(JSON.stringify(JSON.parse(output))));
    let schemas = JSON.parse(output);
    $.each(schemas, function (key, val) {
        $("#my-content .row .col-sm-3:nth-child("+(key+1)+") .vis").each( function(k,elem) {
            $(elem).attr("data-vis-json", JSON.stringify(val));
            vegaEmbed(elem, val);
        })
    })

    $("#nextiteration").removeAttr("disabled");
    $(".vis").removeClass("selectedPositive");
    $("#nextiteration").find(".fa").addClass("hidden");
    $(".modalForDisablingEvents").hide();
    $(".vis").css('visibility','visible');
    UIparameters.positiveSchemas = [];
})

$("#dataset").on("change", function() {
    if($.data(this, 'current') == undefined) {
        $.data(this, 'current', "Iris");
    }
    if (window.confirm("Are you sure?")) {
        $('.modalForDisablingEvents2').hide();
        UIparameters.dataset = $(this).val();
        UIparameters.init = false;
        UIparameters.chosenColumns = {};
        $(".vis").css('visibility','hidden');
        loadDataset();
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

$("#nextiteration").on("click", function() {
    if( $(this).attr("disabled") != "disabled" ) {
      console.log(UIparameters.chosenColumns.length);
        if( Object.keys(UIparameters.chosenColumns).length == 0 ) {
          alert("Chose at least one column");
        } else if( Object.keys(UIparameters.chosenColumns).length != 0 &&  !UIparameters.init) {
            $(this).attr("disabled","disabled");
            $(this).find(".modalForDisablingEvents .fa").removeClass("hidden");
            $(".modalForDisablingEvents").height(
                $("#my-content").height()
            ).show();

            $(this).find(".modalForDisablingEvents2 .fa").removeClass("hidden");
            $(".modalForDisablingEvents2").height(
                $("#columns").height()+$("#columns").attr("padding-top")+$("#columns").attr("padding-bottom")
            ).show();
            UIparameters.init = true;
            win.webContents.send('init-visualisations', JSON.stringify(UIparameters), windowID);
        } else if( UIparameters.positiveSchemas.length == 0 ) {
            alert("No positive schema was chosen");
        } else {
            $(this).attr("disabled","disabled");
            $(this).find(".fa").removeClass("hidden");
            $(".modalForDisablingEvents").height(
                $("#my-content").height()
            ).show();
            win.webContents.send('next-visualisations', JSON.stringify(UIparameters), windowID);
        }
    }
});

$("#columns").on("click", ".list-group-item", function(event) {
  if(event.target.nodeName == "SELECT") return;
  var val = $(this).find('strong').text();
  if( $(this).hasClass('bg-primary') ) {
    $(this).removeClass('bg-primary');
    delete UIparameters.chosenColumns[val];
  } else {
    UIparameters.chosenColumns[val] = $(this).find('select').val();;
    $(this).addClass('bg-primary');
  }
});

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
    "contextmenu": function (e) {
      var top = e.pageY;
      var left = e.pageX-$(this).width();
      $("#context-menu").css({
        display: "block",
        top: top,
        left: left
      });
      $("#export-json").attr("data-vis-json", $(this).attr("data-vis-json"));
      return false;
    }
});

function checkDatatypes(data) {
  var columns = Object.keys(data[0]);
  var datatypes = {};
  $.each(columns, function(key, value) {
    var temp = {};
    $.each(data, function(k, v) {
      if( isNaN(parseInt(v[value])) ) {
        datatypes[value] = "nominal";
        return false;
      }
      if(typeof temp[v[value]] == 'undefined') temp[v[value]] = 0;
      temp[v[value]]++;
    });
    var uniqueNumbers = Object.keys(temp).length;
    datatypes[value] = (uniqueNumbers/data.length > 0.1? "quantitative":"nominal");
  });
  return datatypes;
}

function loadDataset() {
  let data = JSON.parse(fs.readFileSync(path.join(__dirname, UIparameters.dataset)));
  var availableColumns = checkDatatypes(data);
  reloadColumns(availableColumns);
}

function reloadColumns(availableColumns) {
  var $columns = $("#columns ul");
  $columns.html("");
  console.log(availableColumns);
  $.each(availableColumns, function(key, value) {
    var $item = $('<li class="list-group-item"></li>');
    var $name = $('<strong>'+key+'</strong>');
    var $select = $('<select class="float-right"></select>');
    var selectOptions = ['quantitative', 'nominal', 'ordinal'];
    $.each(selectOptions, function(k, v) {
      var $option =  $('<option>'+v+'</option>');
      if(v == value ) {
        $option.prop('selected',true);
      }
      $select.append($option);
    });
    $item.append($name);
    $item.append($select);
    $columns.append($item);
  });
}

function unique(arr) {
  var i,
      len = arr.length,
      out = [],
      obj = { };

  for (i = 0; i < len; i++) {
      obj[arr[i]] = 0;
  }
  for (i in obj) {
      out.push(i);
  }
  return out;
};


$("body").click(function(event) {
  if(event.target.nodeName != "A") {
    $("#context-menu").hide();
  }
});

$("#export-json").click(function() {
  var json = JSON.parse($(this).attr("data-vis-json"));
  var deepcopyJson = $.extend(true, {}, json);
  delete deepcopyJson.data;
  $("#export-json-modal .modal-body").html("<pre>"+JSON.stringify(deepcopyJson, false, 2)+"</pre><span id='copyText' style='display: none'>"+JSON.stringify(json, false, 2)+"</span>");
  $("#export-json-modal").modal({"show": true});
});

// author: jfriend00 from https://stackoverflow.com/questions/22581345/click-button-copy-to-clipboard-using-jquery
document.getElementById("copy-to-clipboard").addEventListener("click", function() {
    copyToClipboard(document.getElementById("copyText"));
});

function copyToClipboard(elem) {
	  // create hidden text element, if it doesn't already exist
    var targetId = "_hiddenCopyText_";
    var isInput = elem.tagName === "INPUT" || elem.tagName === "TEXTAREA";
    var origSelectionStart, origSelectionEnd;
    if (isInput) {
        // can just use the original source element for the selection and copy
        target = elem;
        origSelectionStart = elem.selectionStart;
        origSelectionEnd = elem.selectionEnd;
    } else {
        // must use a temporary form element for the selection and copy
        target = document.getElementById(targetId);
        if (!target) {
            var target = document.createElement("textarea");
            target.style.position = "absolute";
            target.style.left = "-9999px";
            target.style.top = "0";
            target.id = targetId;
            document.body.appendChild(target);
        }
        target.textContent = elem.textContent;
    }
    // select the content
    var currentFocus = document.activeElement;
    target.focus();
    target.setSelectionRange(0, target.value.length);

    // copy the selection
    var succeed;
    try {
    	  succeed = document.execCommand("copy");
    } catch(e) {
        succeed = false;
    }
    // restore original focus
    if (currentFocus && typeof currentFocus.focus === "function") {
        currentFocus.focus();
    }

    if (isInput) {
        // restore prior selection
        elem.setSelectionRange(origSelectionStart, origSelectionEnd);
    } else {
        // clear temporary content
        target.textContent = "";
    }
    return succeed;
}
