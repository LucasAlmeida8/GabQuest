/* js/storage.js — Leitura e escrita no LocalStorage */
'use strict';

const Storage = (() => {

  const KEY = 'matKids_v2'; // bumped to add new fields cleanly

  const DEFAULT = {
    avatar: '🐱',
    sound: true,
    ops: {
      add: { level: 1, xp: 0, stars: [0,0,0,0,0], consecWins: 0 },
      sub: { level: 1, xp: 0, stars: [0,0,0,0,0], consecWins: 0 },
      mul: { level: 1, xp: 0, stars: [0,0,0,0,0], consecWins: 0 },
      div: { level: 1, xp: 0, stars: [0,0,0,0,0], consecWins: 0 }
    },
    medals: {
      add: false, sub: false, mul: false, div: false, genius: false
    },
    trophies: {
      allAdd: false, allSub: false, allMul: false, allDiv: false, allOps: false,
      perfect1: false
    },
    achievements: {
      streak10: false, streak25: false, streak50: false, streak100: false
    },
    voice: true,
    shapes: { level: 1, correct: 0, wrong: 0, streak: 0 },
    unlockedAvatars: ['🐱'],
    errorLog: [], // max 50 últimos erros: { q, correct, chosen, op, date }
    stats: {
      totalTime: 0,
      totalQ: 0,
      totalCorrect: 0,
      totalWrong: 0,
      sessionStart: null,
      opCorrect: { add:0, sub:0, mul:0, div:0 },
      opWrong:   { add:0, sub:0, mul:0, div:0 }
    }
  };

  function _load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT));
      return JSON.parse(raw);
    } catch(e) {
      return JSON.parse(JSON.stringify(DEFAULT));
    }
  }

  function _save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); }
    catch(e) { console.warn('Storage error:', e); }
  }

  function get()         { return _load(); }
  function save(data)    { _save(data); }
  function resetAll()    { localStorage.removeItem(KEY); }

  // Helpers de acesso rápido
  function getOp(op)     { return _load().ops[op]; }

  function saveOp(op, opData) {
    const d = _load();
    d.ops[op] = opData;
    _save(d);
  }

  function getAvatar()   { return _load().avatar; }
  function setAvatar(a)  { const d=_load(); d.avatar=a; _save(d); }

  function getSound()    { return _load().sound; }
  function setSound(v)   { const d=_load(); d.sound=v; _save(d); }

  function getMedals()   { return _load().medals; }
  function getTrophies() { return _load().trophies; }
  function getAchievements() { return _load().achievements; }
  function getUnlockedAvatars() { return _load().unlockedAvatars; }
  function getStats()    { return _load().stats; }

  function unlockAvatar(a) {
    const d = _load();
    if (!d.unlockedAvatars.includes(a)) { d.unlockedAvatars.push(a); _save(d); }
  }

  function setMedal(key, val) {
    const d = _load(); d.medals[key] = val; _save(d);
  }
  function setTrophy(key, val) {
    const d = _load(); d.trophies[key] = val; _save(d);
  }
  function setAchievement(key, val) {
    const d = _load(); d.achievements[key] = val; _save(d);
  }

  function updateStats(patch) {
    const d = _load();
    Object.assign(d.stats, patch);
    _save(d);
  }

  // Estrelas totais
  function getTotalStars() {
    const d = _load();
    return Object.values(d.ops).reduce((acc, op) => acc + op.stars.reduce((a,b)=>a+b,0), 0);
  }
  function getTotalMedals() {
    return Object.values(_load().medals).filter(Boolean).length;
  }
  function getTotalTrophies() {
    return Object.values(_load().trophies).filter(Boolean).length;
  }

  function getVoice()    { return _load().voice !== false; }
  function setVoice(v)   { const d=_load(); d.voice=v; _save(d); }

  function getShapes()   { const d=_load(); return d.shapes || { level:1, correct:0, wrong:0, streak:0 }; }
  function saveShapes(s) { const d=_load(); d.shapes=s; _save(d); }

  function logError(entry) {
    const d = _load();
    if (!d.errorLog) d.errorLog = [];
    d.errorLog.unshift({ ...entry, date: new Date().toLocaleString('pt-BR') });
    if (d.errorLog.length > 50) d.errorLog = d.errorLog.slice(0, 50);
    _save(d);
  }
  function getErrorLog() { return _load().errorLog || []; }

  return {
    get, save, resetAll,
    getOp, saveOp,
    getAvatar, setAvatar,
    getSound, setSound,
    getVoice, setVoice,
    getMedals, getTrophies, getAchievements,
    getUnlockedAvatars, unlockAvatar,
    setMedal, setTrophy, setAchievement,
    updateStats, getStats,
    getTotalStars, getTotalMedals, getTotalTrophies,
    getShapes, saveShapes,
    logError, getErrorLog
  };
})();
