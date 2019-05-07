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
        })
    }

    constructor(random = true) {
        if(random) {
            this.tree = {};
            var x = {};
            var y = {};
            let symbol = grammar.StartingSymbol[0];
            var chosenColumnsCount = Object.keys(Individual.prototype.chosenColumns).length

            this.expandNode(this.tree, symbol, null, null);
            if( typeof this.tree.encoding == 'undefined' ) {
              this.tree.start.encoding = {};
            }
            if(chosenColumnsCount >= 1) {
              this.expandNode(x, "x", null, null);
              this.tree.start.encoding.x = x.x;
            }
            if(chosenColumnsCount >= 2 ) { //&& this.tree.start.mark == 'area'
              this.expandNode(y, "y", null, null);
              this.tree.start.encoding.y = y.y;
            }
            this.removeEpsilons(this.tree);
            this.checkProperTypeFields(this.tree);
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

    checkUsedColumns(parent) {
      $.each(parent, function(key, child) {
        if( typeof child === 'object' && child) {
          Individual.prototype.checkUsedColumns(child);
        } else {
          if( typeof parent["field"] != 'undefined') {
            if( typeof Individual.prototype.usedColumns[parent["field"]] == 'undefined') {
              Individual.prototype.usedColumns[parent["field"]] = true;
            } else if( Object.keys(Individual.prototype.usedColumns).length >= Object.keys(Individual.prototype.chosenColumns).length ) {
              console.log("error", parent, parent['key']);
            } else {
              var sub = Individual.prototype.chosenColumns[Math.floor(Math.random()*Object.keys(Individual.prototype.chosenColumns).length)];
              while( typeof Individual.prototype.usedColumns[parent["field"]] != 'undefined' ) {
                sub = Individual.prototype.chosenColumns[Math.floor(Math.random()*Object.keys(Individual.prototype.chosenColumns).length)];
                break; // oh shit
              }
              parent["field"] = sub;
              Individual.prototype.usedColumns[parent["field"]] = true;
            }
          }
        }
      });
    }

    expandNode(parent, node, parentsParent, parentsNode) {
        if(this.isTerminal(node)) {
            parentsParent[parentsNode] = node;
            return;
        }

        parent[node] = {}
        var chooseRandomRule = this.getRandomRule(node);
        $.each( grammar.Expressions[node][chooseRandomRule], function (key, symbol) {
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
        console.log(this.tree);
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

module.exports = {
    Individual : Individual
}
