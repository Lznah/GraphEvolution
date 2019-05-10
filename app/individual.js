'use strict'

class Individual{

    checkProperTypeFields(parent) {
        $.each(parent, function(key, child) {
            if( typeof child === 'object' && child) {
                Individual.prototype.checkProperTypeFields(child);
            } else {
                if(parent["type"] != undefined) {
                    parent["type"] = Individual.prototype.chosenColumns[parent["field"]];
                }
            }
        });
    }

    checkProperTransformations(encodings) {
        $.each(encodings, function(index, elem) {
            if(elem.type == "nominal") {
              if(elem.aggregate != "undefined") delete elem.aggregate;
              if(elem.stack != "undefined") delete elem.stack;
              if(elem.bin != "undefined") delete elem.bin;
            }
        });
    }

    constructor(random = true) {
        if(random) {
            this.tree = {};
            var x = {};
            var y = {};
            var tempFields = [...grammar.Expressions["field"]];
            let symbol = grammar.StartingSymbol[0];

            this.expandNode(this.tree, symbol, null, null);
            this.removeEpsilons(this.tree);
            this.checkEmptyEncodings(this.tree.start.encoding);
            grammar.Expressions["field"] = [...tempFields];
            this.checkProperTypeFields(this.tree);
            this.checkXY(this.tree.start.encoding);
            this.checkProperTransformations(this.tree.start.encoding);
        }
    }

    checkEmptyEncodings(encodings) {
      $.each(encodings, function(key, child) {
          if(typeof child["field"] == "undefined") {
            delete encodings[key];
          }
      });
    }


    checkXY(encodings) {
      var x, y;
      if(typeof encodings.x == "undefined") {
        var randomEncodingIndex = Math.floor(Math.random()*Object.keys(encodings).length);
        var randomEncodingKey = Object.keys(encodings)[randomEncodingIndex];
        x = encodings[randomEncodingKey];
        delete encodings[randomEncodingKey];
      }
      if(typeof encodings.y == "undefined" && Object.keys(Individual.prototype.chosenColumns).length >= 2) {
        var randomEncodingIndex = Math.floor(Math.random()*Object.keys(encodings).length);
        var randomEncodingKey = Object.keys(encodings)[randomEncodingIndex];
        y = encodings[randomEncodingKey];
        delete encodings[randomEncodingKey];
      }
      if(typeof x != "undefined") {
        encodings.x = x;
      }
      if(typeof y != "undefined") {
        encodings.y = y;
      }
    }


    removeEpsilons(parent) {
        $.each(parent, function(key, child) {
            if( typeof child === 'object' && child) {
                if( Object.keys(child).length == 0 ) {
                    delete parent[key];
                } else {
                    Individual.prototype.removeEpsilons(child);
                }
            }
        })
    }

    expandNode(parent, node, parentsParent, parentsNode) {
        if(this.isTerminal(node)) {
            parentsParent[parentsNode] = node;
            return;
        }

        parent[node] = {}
        var chooseRandomRule = this.getRandomRule(node);
        if(typeof grammar.Expressions[node][chooseRandomRule] == "undefined") return;
        shuffle(grammar.Expressions[node][chooseRandomRule]);
        $.each( grammar.Expressions[node][chooseRandomRule], function (key, symbol) {
          if(node == "field") {
            $.each(grammar.Expressions["field"], function(index, e) {
              if(e[0] == symbol) {
                grammar.Expressions["field"].splice(index, 1);
                return false;
              }
            })
          }
          Individual.prototype.expandNode(parent[node], symbol, parent, node);
        })
    }

    expandRandomNode(parent, probability) {
        $.each( parent, function(childName, childValue) {
            if(probability > Math.random()*100) {
                Individual.prototype.expandNode(parent, childName, null, null);
            }

            if( typeof childValue === 'object' && childValue) {
              Individual.prototype.expandRandomNode(childValue, probability);
            }
        })
    }
    getGene() {
        return this.tree;
    }
    isTerminal(node) {
        return grammar.Expressions[node] == undefined;
    }
    getRandomRule(node) {
        return Math.floor(Math.random() * grammar.Expressions[node].length);
    }
    getNodes(parent) {
        let nodes = [];
        $.each(parent, function(childName, childValue) {
            nodes.push(childName);
            let childNodes = [];
            if( typeof childValue === 'object' && childValue) {
                childNodes = Individual.prototype.getNodes(childValue);
            }
            nodes = nodes.concat(childNodes);
        })
        return nodes;
    }
    getRandomSubTreeByName(parent, name, counter) {
        var subtree = null;
        $.each(parent, function(childName, childValue) {
            if(childName == name) {
                counter--;
                if(counter == 0) {
                    if(typeof childValue === 'object') {
                        subtree = $.extend(true, {}, childValue);
                    } else {
                        subtree = childValue;
                    }
                    return subtree;
                }
            }
            if( typeof childValue === 'object' && childValue) {
                subtree = Individual.prototype.getRandomSubTreeByName(childValue, name, counter);
                if(subtree != null) {
                    return subtree;
                }
            }
        })
        return subtree
    }
    setRandomSubTreeByName(parent, name, counter, subtree) {
        $.each(parent, function(childName, childValue) {
            if(childName == name) {
                counter--;
                if(counter == 0 || true) {
                    parent[name] = subtree;
                    return;
                }
            }
            if( typeof childValue === 'object' && childValue) {
                Individual.prototype.setRandomSubTreeByName(childValue, name, counter, subtree);
            }
        })
    }
    clone(individual) {
        this.tree = $.extend(true, {}, individual.tree);
    }
}


// @author https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

module.exports = {
    Individual : Individual
}
