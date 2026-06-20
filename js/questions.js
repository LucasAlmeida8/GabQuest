/* js/questions.js — Gerador de questões por operação e nível */
'use strict';

const Questions = (() => {

  let _lastQuestion = null;

  function _rnd(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generate(op, level) {
    const cfg = Levels.getLevelConfig(op, level);
    let q, tries = 0;
    do {
      q = _make(op, cfg);
      tries++;
    } while (tries < 20 && _lastQuestion && q.text === _lastQuestion.text);
    _lastQuestion = q;
    return q;
  }

  function _make(op, cfg) {
    switch(op) {
      case 'add': return _makeAdd(cfg);
      case 'sub': return _makeSub(cfg);
      case 'mul': return _makeMul(cfg);
      case 'div': return _makeDiv(cfg);
      default: return _makeAdd(cfg);
    }
  }

  function _makeAdd(cfg) {
    const m = cfg.max;
    const a = _rnd(1, m), b = _rnd(1, m);
    return { a, b, op:'add', symbol:'+', answer: a+b, text:`${a} + ${b} = ?` };
  }

  function _makeSub(cfg) {
    const m = cfg.max;
    let a = _rnd(1, m), b = _rnd(1, m);
    if (b > a) [a, b] = [b, a]; // garante resultado ≥ 0
    return { a, b, op:'sub', symbol:'−', answer: a-b, text:`${a} − ${b} = ?` };
  }

  function _makeMul(cfg) {
    const t = cfg.tableMax;
    const a = _rnd(1, t), b = _rnd(1, t);
    return { a, b, op:'mul', symbol:'×', answer: a*b, text:`${a} × ${b} = ?` };
  }

  function _makeDiv(cfg) {
    const m = cfg.max;
    // Gera divisão exata: escolhe resultado e divisor
    const result = _rnd(1, m);
    const divisor = _rnd(1, Math.min(m, 12));
    const dividend = result * divisor;
    return {
      a: dividend, b: divisor, op:'div', symbol:'÷',
      answer: result, text:`${dividend} ÷ ${divisor} = ?`
    };
  }

  // Gera 4 alternativas incluindo a correta
  function generateOptions(answer) {
    const opts = new Set();
    opts.add(answer);
    const range = Math.max(10, Math.ceil(answer * .5));
    let tries = 0;
    while (opts.size < 4 && tries < 200) {
      const delta = _rnd(-range, range);
      const wrong = answer + delta;
      if (wrong !== answer && wrong >= 0) opts.add(wrong);
      tries++;
    }
    // fallback se necessário
    let fill = 1;
    while (opts.size < 4) { if (!opts.has(fill)) opts.add(fill); fill++; }
    return _shuffle([...opts]);
  }

  function _shuffle(arr) {
    for (let i = arr.length-1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i+1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  return { generate, generateOptions };
})();
