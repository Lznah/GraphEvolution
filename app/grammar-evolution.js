'use strict'
const {Individual} = require("./individual.js");

class GrammarEvolution{
    constructor() {
        this.population = [];
        this.mutationRate = 0;
        this.crossoverRate = 0;
    }
    initPopulation(populationSize, UIparameters) {
        this.populationSize = populationSize;
        this.chosenColumns = UIparameters.chosenColumns;
        Individual.prototype.chosenColumns = UIparameters.chosenColumns;
        for(var i=0; i < populationSize; i++) {
            this.population[i] = new Individual();
        }
    }

    nextPopulation(UIparameters) {
        this.mutationRate = UIparameters.mutation;
        this.crossoverRate = UIparameters.crossover;
        this.clearPopulation(UIparameters.positiveSchemas);
        this.evolve();
    }

    clearPopulation(selectedIds) {
        var temparray = []
        for(let i=0; i<this.populationSize; i++) {
            temparray.push(i);
        }
        $.each(selectedIds, function(key, val) {
            delete temparray[val];
        })
        temparray = temparray.filter(function(x){
            return (x !== (undefined || null || ''));
        });
        for(let i=0; i<temparray.length; i++) {
            delete this.population[temparray[i]];
        }
        this.population = this.population.filter(function(x){
            return (x !== (undefined || null || ''));
        });
    }

    getIndividual(index) {
        return this.population[index];
    }

    evolve() {
        let chosenPositiveCounter = this.population.length
        while(this.population.length != this.populationSize) {
            let ancensor1 = this.getRandomIndividual(chosenPositiveCounter);
            let ancensor2 = this.getRandomIndividual(chosenPositiveCounter);
            let descendant = new Individual(false);
            descendant.clone(ancensor1);
            if(this.crossoverRate > Math.floor(Math.random()*100)) {
                this.crossover(descendant, ancensor2);
            }
            this.mutate(descendant);
            this.repair(descendant);
            this.population.push(descendant);
        }
    }

    repair(individual) {
        individual.removeEpsilons(individual.tree);
        individual.checkProperTypeFields(individual.tree);
        Individual.prototype.usedColumns = {};
        individual.checkUsedColumns(individual.tree);
    }

    crossover(individual1, individual2) {
        let nodesOfIndividual1 = individual1.getNodes(individual1.tree["start"]);
        let nodesOfIndividual1Unique = nodesOfIndividual1.unique();
        let nodesOfIndividual2 = individual2.getNodes(individual2.tree["start"]);
        let nodesOfIndividual2Unique = nodesOfIndividual2.unique();
        let matchingNodes = nodesOfIndividual1.diff(nodesOfIndividual2);
        if( Math.random()*100 > this.mutationRate ) {
            let randomNodeForCrossoverPosition = Math.floor(Math.random()*matchingNodes.length);
            let randomNodeForCrossover = matchingNodes[randomNodeForCrossoverPosition];
            let randomNodeCountInIndividual1Tree = 0;
            for(let i=0; i<nodesOfIndividual1.length; i++) {
                if(nodesOfIndividual1[i] == randomNodeForCrossover) {
                    randomNodeCountInIndividual1Tree++;
                }
            }
            let randomNodeCountInIndividual2Tree = 0;
            for(let i=0; i<nodesOfIndividual2.length; i++) {
                if(nodesOfIndividual2[i] == randomNodeForCrossover) {
                    randomNodeCountInIndividual2Tree++;
                }
            }
            let randomNodeFromRandomMatchingNodesForIndividual2 = Math.floor(Math.random()*randomNodeCountInIndividual2Tree);
            let getSubtreeFromIndividual2 = individual2.getRandomSubTreeByName(individual2.tree["start"]["encoding"], randomNodeForCrossover, randomNodeFromRandomMatchingNodesForIndividual2);
            let randomNodeFromRandomMatchingNodesForIndividual1 = Math.floor(Math.random()*randomNodeCountInIndividual1Tree);
            individual1.setRandomSubTreeByName(individual1.tree["start"]["encoding"], randomNodeForCrossover, randomNodeFromRandomMatchingNodesForIndividual1, getSubtreeFromIndividual2);
        }
    }


    mutate(individual) {
        Individual.prototype.expandRandomNode(individual.tree["start"], this.mutationRate);
    }

    getRandomIndividual(chosenPositiveCounter) {
        return this.population[Math.floor(Math.random()*chosenPositiveCounter)];
    }
    selection() {}
    getFitness() {}
    getPhenotype() {}
}

// @Author> LiraNuna
// https://stackoverflow.com/questions/1584370/how-to-merge-two-arrays-in-javascript-and-de-duplicate-items
Array.prototype.unique = function() {
    var a = this.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};

// @Author> jeremy
// https://stackoverflow.com/questions/12433604/how-can-i-find-matching-values-in-two-arrays
Array.prototype.diff = function(arr2) {
    var ret = [];
    this.sort();
    arr2.sort();
    for(var i = 0; i < this.length; i += 1) {
        if(arr2.indexOf(this[i]) > -1){
            ret.push(this[i]);
        }
    }
    return ret;
};

module.exports = {
    GrammarEvolution : GrammarEvolution
}
