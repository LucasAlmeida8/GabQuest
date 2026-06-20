/* js/game.js — Controlador principal do jogo */
'use strict';

const Game = (() => {

  // --- Estado da sessão atual ---
  let state = {
    op: null,
    level: 1,
    xp: 0,
    score: 0,
    streak: 0,      // acertos globais seguidos (para conquistas)
    consecWins: 0,  // consecutivos para subir nível
    correct: 0,
    wrong: 0,
    currentQ: null,
    waiting: false,
    sessionStart: null
  };

  // --- Sons (Web Audio API, sem arquivos externos) ---
  let _audioCtx = null;
  function _getCtx() {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return _audioCtx;
  }

  function _beep(freq, dur, type='sine', vol=.3) {
    if (!Storage.getSound()) return;
    try {
      const ctx = _getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = type; osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + dur);
      osc.start(); osc.stop(ctx.currentTime + dur);
    } catch(e) {}
  }

  function _soundCorrect()     { _beep(660,.12); setTimeout(()=>_beep(880,.15),120); }
  function _soundWrong()       { _beep(220,.25,'sawtooth',.2); }
  function _soundLevelUp()     { [523,659,784,1047].forEach((f,i)=>setTimeout(()=>_beep(f,.18),i*110)); }
  function _soundAchievement() { [784,880,988,1047].forEach((f,i)=>setTimeout(()=>_beep(f,.15),i*80)); }

  function toggleSound() {
    const newVal = !Storage.getSound();
    Storage.setSound(newVal);
    UI.updateSoundUI(newVal);
    if (newVal) _beep(440,.1); // feedback sonoro ao ativar
  }

  // --- Selecionar operação e iniciar ---
  function selectOperation(op) {
    state.op = op;
    const opData = Storage.getOp(op);
    state.level      = opData.level;
    state.xp         = opData.xp;
    state.score      = 0;
    state.streak     = 0;
    state.consecWins = opData.consecWins || 0;
    state.correct    = 0;
    state.wrong      = 0;
    state.waiting    = false;
    state.sessionStart = Date.now();

    // Atualizar UI do jogo
    document.getElementById('game-op-label').textContent    = Levels.opLabel(op);
    document.getElementById('game-level-label').textContent = 'Nível ' + state.level;
    UI.setAvatarDisplay(Storage.getAvatar());
    UI.updateSoundUI(Storage.getSound());

    _updateStats();
    _nextQuestion();
    UI.showScreen('screen-game');
  }

  // --- Próxima pergunta ---
  function _nextQuestion() {
    if (state.waiting) return;
    state.currentQ = Questions.generate(state.op, state.level);
    const opts = Questions.generateOptions(state.currentQ.answer);
    UI.renderQuestion(state.currentQ, opts, _onAnswer);
  }

  // --- Resposta do jogador ---
  function _onAnswer(chosen, btn, correctAnswer) {
    if (state.waiting) return;
    state.waiting = true;

    const allBtns = document.querySelectorAll('.answer-btn');
    const isCorrect = chosen === correctAnswer;

    UI.markAnswer(btn, isCorrect, allBtns, correctAnswer);

    if (isCorrect) {
      _handleCorrect();
    } else {
      _handleWrong();
    }

    setTimeout(() => {
      state.waiting = false;
      _nextQuestion();
    }, 1100);
  }

  function _handleCorrect() {
    state.score      += 10 + state.level * 2;
    state.correct    += 1;
    state.streak     += 1;
    state.consecWins += 1;

    const xpGain = Levels.xpGain(state.op, state.level, true);
    state.xp += xpGain;

    _soundCorrect();

    const msg = UI.getStreakMessage(state.streak);
    const feedbackText = msg ? msg.text : 'Correto! ✅';
    UI.showFeedback(feedbackText, true);

    // Voz em marcos de sequência
    if (msg && typeof Voice !== 'undefined') Voice.say(msg.text);

    _checkStreakAchievements();
    if (Levels.shouldLevelUp(state.consecWins)) _levelUp();
    else _updateStats();

    _persist();
    _updateParentStats(true);
  }

  function _handleWrong() {
    state.wrong      += 1;
    state.streak      = 0;
    state.consecWins  = 0;

    _soundWrong();
    UI.showFeedback('Quase! Tente de novo 💪', false);

    // Registrar erro detalhado
    if (state.currentQ) {
      Storage.logError({
        q:       state.currentQ.text,
        correct: state.currentQ.answer,
        chosen:  '—',
        op:      Levels.opLabel(state.op)
      });
    }

    _updateStats();
    _persist();
    _updateParentStats(false);
  }

  // --- Subida de nível ---
  function _levelUp() {
    if (state.level >= Levels.MAX_LEVEL) {
      // Já no nível máximo — bônus de XP mas sem subir
      state.consecWins = 0;
      _persist();
      _updateStats();
      _checkMedalsAndTrophies();
      return;
    }

    // Salvar estrela no nível atual
    const data  = Storage.get();
    const opData = data.ops[state.op];
    const stars  = Math.min(3, state.consecWins); // até 3 estrelas
    opData.stars[state.level - 1] = stars;

    state.level += 1;
    state.consecWins = 0;
    opData.level = state.level;
    opData.consecWins = 0;

    data.ops[state.op] = opData;
    Storage.save(data);

    _soundLevelUp();
    if (typeof Voice !== 'undefined')
      Voice.say(`Parabéns! Você chegou ao nível ${state.level} de ${Levels.opLabel(state.op)}!`);
    if (typeof Mascote !== 'undefined')
      Mascote.speak(`Nível ${state.level}! Continue assim! 🚀`);
    document.getElementById('game-level-label').textContent = 'Nível ' + state.level;
    UI.showLevelUp(state.op, state.level, stars);
    _updateStats();
    _checkMedalsAndTrophies();
  }

  // --- Verificar conquistas de sequência ---
  function _checkStreakAchievements() {
    const ach = Storage.getAchievements();
    const milestones = [
      { key:'streak10',  val:10,  icon:'🔥', name:'10 Acertos Seguidos!'  },
      { key:'streak25',  val:25,  icon:'💫', name:'25 Acertos Seguidos!'  },
      { key:'streak50',  val:50,  icon:'⚡', name:'50 Acertos Seguidos!'  },
      { key:'streak100', val:100, icon:'🌈', name:'100 Acertos Seguidos!' }
    ];
    milestones.forEach(m => {
      if (!ach[m.key] && state.streak >= m.val) {
        Storage.setAchievement(m.key, true);
        _soundAchievement();
        setTimeout(() => UI.showAchievement(m.icon, m.name), 400);
        // Desbloquear avatar relacionado
        _unlockAvatarByKey(m.key);
      }
    });
  }

  // --- Verificar medalhas e troféus ---
  function _checkMedalsAndTrophies() {
    const data     = Storage.get();
    const medals   = data.medals;
    const trophies = data.trophies;

    const opsComplete = { add:false, sub:false, mul:false, div:false };
    ['add','sub','mul','div'].forEach(op => {
      opsComplete[op] = data.ops[op].level > Levels.MAX_LEVEL ||
        data.ops[op].stars.every(s => s > 0); // simplificado
    });

    // Medalhas de mestre
    const medalMap = { add:'add', sub:'sub', mul:'mul', div:'div' };
    Object.entries(medalMap).forEach(([op, key]) => {
      if (!medals[key] && data.ops[op].level >= Levels.MAX_LEVEL) {
        Storage.setMedal(key, true);
        _unlockAvatarByKey(op + '_level2');
        setTimeout(() => UI.showAchievement('🏅', 'Mestre da ' + Levels.opLabel(op) + '!'), 600);
        _soundAchievement();
      }
    });

    // Troféus por operação
    const trophyMap = { add:'allAdd', sub:'allSub', mul:'allMul', div:'allDiv' };
    Object.entries(trophyMap).forEach(([op, key]) => {
      if (!trophies[key] && data.ops[op].level >= Levels.MAX_LEVEL) {
        Storage.setTrophy(key, true);
      }
    });

    // Gênio / Rei
    const allDone = ['add','sub','mul','div'].every(op => data.ops[op].level >= Levels.MAX_LEVEL);
    if (allDone) {
      if (!medals.genius) {
        Storage.setMedal('genius', true);
        setTimeout(() => UI.showAchievement('🧠', 'Gênio da Matemática!'), 800);
        _soundAchievement();
      }
      if (!trophies.allOps) {
        Storage.setTrophy('allOps', true);
        _unlockAvatarByKey('allOps');
      }
    }

    // Trophy perfeição (5 acertos nível 1 sem erro)
    if (!trophies.perfect1 && state.consecWins >= 5 && state.wrong === 0 && state.level === 1) {
      Storage.setTrophy('perfect1', true);
      _unlockAvatarByKey('perfect1');
    }
  }

  // --- Desbloquear avatar ---
  function _unlockAvatarByKey(key) {
    const meta = UI.getAvatarMeta();
    const av = meta.find(a => a.unlock === key);
    if (av) Storage.unlockAvatar(av.icon);
  }

  // --- Persisitir estado do op ---
  function _persist() {
    const opData = Storage.getOp(state.op);
    opData.level      = state.level;
    opData.xp         = state.xp;
    opData.consecWins = state.consecWins;
    Storage.saveOp(state.op, opData);
  }

  // --- Atualizar UI de stats do jogo ---
  function _updateStats() {
    UI.updateGameStats({
      score:   state.score,
      streak:  state.streak,
      correct: state.correct,
      wrong:   state.wrong,
      consec:  state.consecWins
    });
    UI.updateXPBar(state.xp, Levels.xpForLevel(state.level));
  }

  // --- Atualizar estatísticas do painel de responsáveis ---
  function _updateParentStats(correct) {
    const s = Storage.getStats();
    s.totalQ = (s.totalQ || 0) + 1;
    if (correct) {
      s.totalCorrect = (s.totalCorrect || 0) + 1;
      s.opCorrect = s.opCorrect || {};
      s.opCorrect[state.op] = (s.opCorrect[state.op] || 0) + 1;
    } else {
      s.totalWrong = (s.totalWrong || 0) + 1;
      s.opWrong = s.opWrong || {};
      s.opWrong[state.op] = (s.opWrong[state.op] || 0) + 1;
    }
    // Tempo
    const elapsed = Math.round((Date.now() - (state.sessionStart || Date.now())) / 1000);
    s.totalTime = (s.totalTime || 0) + (correct ? 0 : 0); // acumulado ao sair
    Storage.updateStats(s);
  }

  // --- Sair do jogo ---
  function exitGame() {
    // Salvar tempo de sessão
    if (state.sessionStart) {
      const elapsed = Math.round((Date.now() - state.sessionStart) / 1000);
      const s = Storage.getStats();
      s.totalTime = (s.totalTime || 0) + elapsed;
      Storage.updateStats(s);
      state.sessionStart = null;
    }
    _persist();
    UI.showScreen('screen-home');
  }

  // --- Init ---
  function init() {
    // Garantir avatar correto na home
    UI.setAvatarDisplay(Storage.getAvatar());
    UI.updateSoundUI(Storage.getSound());
    UI._refreshHome && UI._refreshHome();
  }

  // Inicializa ao carregar
  window.addEventListener('DOMContentLoaded', init);

  function toggleVoice() {
    if (typeof Voice !== 'undefined') Voice.toggle();
  }

  return { selectOperation, exitGame, toggleSound, toggleVoice };
})();
