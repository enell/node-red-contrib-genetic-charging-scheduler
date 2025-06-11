type Settings<P> = {
  mutationFunction: (phenotype: P) => P;
  crossoverFunction: (a: P, b: P) => [P] | [P, P];
  fitnessFunction: (phenotype: P) => number;
  doesABeatBFunction?: (a: P, b: P) => boolean;

  population: P[];
  populationSize: number;
};

export type Options<P> = Partial<Settings<P>>;

export function geneticAlgorithmConstructor<P>(options: Options<P>) {
  function settingDefaults(): Settings<P> {
    return {
      mutationFunction: function (phenotype: P) {
        return phenotype;
      },

      crossoverFunction: function (a: P, b: P) {
        return [a, b];
      },

      fitnessFunction: function () {
        return 0;
      },

      doesABeatBFunction: undefined,

      population: [],
      populationSize: 100,
    };
  }

  function settingWithDefaults(settings: Options<P>, defaults: Settings<P>): Settings<P> {
    const s = { ...defaults, ...settings };

    if (s.population.length <= 0)
      throw Error('population must be an array and contain at least 1 phenotypes');

    if (s.populationSize <= 0) throw Error('populationSize must be greater than 0');

    return s;
  }

  let settings = settingWithDefaults(options, settingDefaults());

  function populate() {
    const size = settings.population.length;
    while (settings.population.length < settings.populationSize) {
      settings.population.push(
        mutate(cloneJSON(settings.population[Math.floor(Math.random() * size)]))
      );
    }
  }

  function cloneJSON<C>(object: C): C {
    if (Array.isArray(object)) {
      return [...object] as C;
    }
    return { ...object };
  }

  function mutate(phenotype: P) {
    return settings.mutationFunction(cloneJSON(phenotype));
  }

  function crossover(phenotype: P) {
    phenotype = cloneJSON(phenotype);
    let mate = settings.population[Math.floor(Math.random() * settings.population.length)];
    mate = cloneJSON(mate);
    return settings.crossoverFunction(phenotype, mate)[0];
  }

  function doesABeatB(a: P, b: P) {
    if (settings.doesABeatBFunction) {
      return settings.doesABeatBFunction(a, b);
    } else {
      return settings.fitnessFunction(a) >= settings.fitnessFunction(b);
    }
  }

  function compete() {
    const nextGeneration = [];

    for (let p = 0; p < settings.population.length - 1; p += 2) {
      const phenotype = settings.population[p];
      const competitor = settings.population[p + 1];

      nextGeneration.push(phenotype);
      if (doesABeatB(phenotype, competitor)) {
        if (Math.random() < 0.5) {
          nextGeneration.push(mutate(phenotype));
        } else {
          nextGeneration.push(crossover(phenotype));
        }
      } else {
        nextGeneration.push(competitor);
      }
    }

    settings.population = nextGeneration;
  }

  function randomizePopulationOrder() {
    for (let index = 0; index < settings.population.length; index++) {
      const otherIndex = Math.floor(Math.random() * settings.population.length);
      const temp = settings.population[otherIndex];
      settings.population[otherIndex] = settings.population[index];
      settings.population[index] = temp;
    }
  }

  return {
    evolve: function (options?: Options<P>) {
      if (options) {
        settings = settingWithDefaults(options, settings);
      }

      populate();
      randomizePopulationOrder();
      compete();
      return this;
    },
    best: function () {
      const scored = this.scoredPopulation();
      const result = scored.reduce(function (a, b) {
        return a.score >= b.score ? a : b;
      }, scored[0]).phenotype;
      return cloneJSON(result);
    },
    bestScore: function () {
      return settings.fitnessFunction(this.best());
    },
    population: function () {
      return cloneJSON(this.config().population);
    },
    scoredPopulation: function () {
      return this.population().map(function (phenotype: P) {
        return {
          phenotype: cloneJSON(phenotype),
          score: settings.fitnessFunction(phenotype),
        };
      });
    },
    config: function () {
      return cloneJSON(settings);
    },
    clone: function (options: Options<P>) {
      return geneticAlgorithmConstructor(
        settingWithDefaults(options, settingWithDefaults(this.config(), settings))
      );
    },
  };
}
