'use strict'

class Individual{

    checkProperTypeFields(parent) {
        var datatypes;
        switch(Object.keys(grammar.Expressions.field).length) {
            case 5:
                datatypes = {
                    "sl": "quantitative",
                    "sw": "quantitative",
                    "pl": "quantitative",
                    "pw": "quantitative",
                    "class": "nominal"
                }
                break
            case 4:
                datatypes = {
                    "Class": "nominal",
                    "Age": "nominal",
                    "Sex": "nominal",
                    "Survived": "nominal"
                }
                break
            case 61:
                datatypes = {
                    "attribute_1": "quantitative",
                    "attribute_2": "quantitative",
                    "attribute_3": "quantitative",
                    "attribute_4": "quantitative",
                    "attribute_5": "quantitative",
                    "attribute_6": "quantitative",
                    "attribute_7": "quantitative",
                    "attribute_8": "quantitative",
                    "attribute_9": "quantitative",
                    "attribute_10": "quantitative",
                    "attribute_11": "quantitative",
                    "attribute_12": "quantitative",
                    "attribute_13": "quantitative",
                    "attribute_14": "quantitative",
                    "attribute_15": "quantitative",
                    "attribute_16": "quantitative",
                    "attribute_17": "quantitative",
                    "attribute_18": "quantitative",
                    "attribute_19": "quantitative",
                    "attribute_20": "quantitative",
                    "attribute_21": "quantitative",
                    "attribute_22": "quantitative",
                    "attribute_23": "quantitative",
                    "attribute_24": "quantitative",
                    "attribute_25": "quantitative",
                    "attribute_26": "quantitative",
                    "attribute_27": "quantitative",
                    "attribute_28": "quantitative",
                    "attribute_29": "quantitative",
                    "attribute_30": "quantitative",
                    "attribute_31": "quantitative",
                    "attribute_32": "quantitative",
                    "attribute_33": "quantitative",
                    "attribute_34": "quantitative",
                    "attribute_35": "quantitative",
                    "attribute_36": "quantitative",
                    "attribute_37": "quantitative",
                    "attribute_38": "quantitative",
                    "attribute_39": "quantitative",
                    "attribute_40": "quantitative",
                    "attribute_41": "quantitative",
                    "attribute_42": "quantitative",
                    "attribute_43": "quantitative",
                    "attribute_44": "quantitative",
                    "attribute_45": "quantitative",
                    "attribute_46": "quantitative",
                    "attribute_47": "quantitative",
                    "attribute_48": "quantitative",
                    "attribute_49": "quantitative",
                    "attribute_50": "quantitative",
                    "attribute_51": "quantitative",
                    "attribute_52": "quantitative",
                    "attribute_53": "quantitative",
                    "attribute_54": "quantitative",
                    "attribute_55": "quantitative",
                    "attribute_56": "quantitative",
                    "attribute_57": "quantitative",
                    "attribute_58": "quantitative",
                    "attribute_59": "quantitative",
                    "attribute_60": "quantitative",
                    "class": "nominal"
                }
                break
        }
        $.each(parent, function(key, child) {
            if( typeof child === 'object' && child) {
                Individual.prototype.checkProperTypeFields(child);
            } else {
                if(parent["type"] != undefined) {
                    parent["type"] = datatypes[parent["field"]];
                }
            }
        })
    }

    constructor(random = true) {
        if(random) {
            this.tree = {};
            let symbol = grammar.StartingSymbol[0];
            this.expandNode(this.tree, symbol, null, null);
            this.removeEpsilons(this.tree);
            this.checkProperTypeFields(this.tree);
            console.log(JSON.stringify(this.tree));
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
        var chooseRandomRule = this.getRandomRule(node)
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
                    console.log(childName,childValue,"wow");
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
                    console.log(subtree);
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
