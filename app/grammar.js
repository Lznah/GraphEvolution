'use strict'

module.exports = {
    grammar : {
        "Expressions": {
            "start": [["mark", "encoding"]],
            "encoding": [["fill", "opacity", "shape", "size", "color", "stroke"]],
            "mark": [["bar"], ["rect"], ["line"], ["point"], ["area"], ["circle"], ["square"]],
            "color": [["aggregate", "bin", "field", "type"]],
            "fill": [["aggregate", "bin", "field", "type"]],
            "opacity": [["aggregate", "bin", "field", "type"]],
            "shape": [["aggregate", "bin", "field", "type"]],
            "size": [["aggregate", "bin", "field", "type"]],
            "stroke": [["aggregate", "bin", "field", "type"]],
            "x": [["aggregate", "bin", "field", "type"]],
            "y": [["aggregate", "bin", "field", "type"]],

            "aggregate": [["mean"],["sum"],["median"],["min"],["max"],["count"],["average"], [], [], [], [], [], [], [], [], [], [], [], [], [], []],
            "bin": [[true], [], [], [], []],
            "field": [],
            "type": [["quantitative"], ["nominal"]]
        },
        "StartingSymbol" : ["start"]
    }
}
