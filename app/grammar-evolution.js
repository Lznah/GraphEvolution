'use strict'
const {Individual} = require("./individual.js");

class GrammarEvolution{
    constructor() {
        this.population = [];
        this.mutationRate = 0;
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
        while(this.population.length < this.populationSize) {
            let ancensor1 = this.getRandomIndividual(chosenPositiveCounter);
            let ancensor2 = this.getRandomIndividual(chosenPositiveCounter);
            let descendant1 = new Individual(false);
            let descendant2 = new Individual(false);
            descendant1.clone(ancensor1);
            if(chosenPositiveCounter > 1 && this.population.length < this.populationSize) {
              descendant2.clone(ancensor2);
              this.crossover(descendant1, descendant2);
              this.mutate(descendant2);
              this.repair(descendant2);
              this.population.push(descendant2);
            }
            this.mutate(descendant1);
            this.repair(descendant1);
            this.population.push(descendant1);
        }
    }

    repair(individual) {
        individual.removeEpsilons(individual.tree);
        individual.checkProperTypeFields(individual.tree);
        individual.checkEmptyEncodings(individual.tree.start.encoding);
        individual.checkXY(individual.tree.start.encoding);
        individual.checkProperTransformations(individual.tree.start.encoding);
        //individual.checkUsedColumns(individual.tree);
    }

    crossover(descendant1, descendant2) {

      var chosenColumnsArray = Object.keys(Individual.prototype.chosenColumns);
      for(var i=0; i<chosenColumnsArray.length; i++) {
        var indexIndividual1 = undefined;
        var indexIndividual2 = undefined;
        $.each(descendant1.tree.start.encoding, function(index, elem) {
          if(typeof index == "undefined") return false;
          if(elem.field == chosenColumnsArray[i]) {
            indexIndividual1 = index;
            return false;
          }
        });
        $.each(descendant2.tree.start.encoding, function(index, elem) {
          if(typeof index == "undefined") return false;
          if(elem.field == chosenColumnsArray[i]) {
            indexIndividual2 = index;
            return false;
          }
        });
        if(typeof indexIndividual1 == "undefined" || typeof indexIndividual2 == "undefined") return;
        var tmp = descendant1.tree.start.encoding[indexIndividual1];
        descendant1.tree.start.encoding[indexIndividual1] = descendant2.tree.start.encoding[indexIndividual2];
        descendant2.tree.start.encoding[indexIndividual2] = tmp;
      }
    }


    mutate(individual) {
      var tmp = [...grammar.Expressions['field']];
      Individual.prototype.expandRandomNode(individual.tree["start"], this.mutationRate);
      this.checkUsedColumns(individual.tree.start.encoding);
      grammar.Expressions['field'] = [...tmp]
    }

    checkUsedColumns(encodings) {
      var usedColumns = {};
      $.each(encodings, function(index, elem) {
        if(typeof usedColumns[elem.field] == "undefined") {
          usedColumns[elem.field] = {
            count: 0,
            columns: []
          };
        }
        usedColumns[elem.field].count++;
        usedColumns[elem.field].columns.push(index);
      });
      var notUsedColumns = [];
      $.each(Individual.prototype.chosenColumns, function(index, elem) {
        if(typeof usedColumns[index] == "undefined") {
          notUsedColumns.push(index);
        }
      });
      $.each(usedColumns, function(index, elem) {
        if(elem.count > 1) {
          $.each(elem.columns, function(i, e) {
            encodings[e].field = notUsedColumns[0];
            notUsedColumns.splice(0, 1);
            elem.count--;
            if(elem.count <= 1) return false;
          });
        }
      });
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
