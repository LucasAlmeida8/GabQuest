/* js/levels.js — Definição dos níveis por operação */
'use strict';

const Levels = (() => {

  const XP_PER_LEVEL = [0, 100, 200, 350, 500, 700]; // xp necessário por nível (1–5)

  const config = {
    add: [
      null,
      { max: 10  },
      { max: 20  },
      { max: 50  },
      { max: 100 },
      { max: 500 }
    ],
    sub: [
      null,
      { max: 10  },
      { max: 20  },
      { max: 50  },
      { max: 100 },
      { max: 500 }
    ],
    mul: [
      null,
      { tableMax: 5  },
      { tableMax: 10 },
      { tableMax: 12 },
      { tableMax: 20 },
      { tableMax: 50 }
    ],
    div: [
      null,
      { max: 10  },
      { max: 20  },
      { max: 50  },
      { max: 100 },
      { max: 500 }
    ]
  };

  const MAX_LEVEL = 5;
  const CONSEC_TO_LEVEL = 5; // acertos consecutivos para subir nível

  function getLevelConfig(op, level) {
    return config[op][level] || config[op][MAX_LEVEL];
  }

  function getMaxLevel() { return MAX_LEVEL; }

  function xpForLevel(level) {
    return XP_PER_LEVEL[Math.min(level, MAX_LEVEL)] || 700;
  }

  function xpGain(op, level, correct) {
    // XP base aumenta com nível; erro dá 0
    const base = [0, 10, 15, 22, 30, 40];
    return correct ? (base[Math.min(level, MAX_LEVEL)] || 10) : 0;
  }

  // Retorna true se subiu de nível
  function shouldLevelUp(consecWins) {
    return consecWins >= CONSEC_TO_LEVEL;
  }

  function opLabel(op) {
    return { add:'Adição', sub:'Subtração', mul:'Multiplicação', div:'Divisão' }[op] || op;
  }

  function opSymbol(op) {
    return { add:'+', sub:'−', mul:'×', div:'÷' }[op] || '?';
  }

  return {
    getLevelConfig, getMaxLevel, xpForLevel, xpGain,
    shouldLevelUp, opLabel, opSymbol, CONSEC_TO_LEVEL, MAX_LEVEL
  };
})();
