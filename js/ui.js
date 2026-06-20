/* js/ui.js — Manipulação do DOM, telas, modais, feedback */
'use strict';

const UI = (() => {

  // --- Navegação de telas ---
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active');
      s.style.display = '';
    });
    const target = document.getElementById(id);
    if (target) {
      target.classList.add('active');
      target.style.display = 'flex';
    }
    // Atualizar dados ao entrar em certas telas
    if (id === 'screen-home')     _refreshHome();
    if (id === 'screen-progress') _refreshProgress();
    if (id === 'screen-rewards')  _refreshRewards();
    if (id === 'screen-avatar')   _refreshAvatars();
    if (id === 'screen-parents')  _refreshParents();
    if (id === 'screen-operations') _refreshOpCards();
  }

  // --- Tabs (Recompensas) ---
  function showTab(name) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + name).classList.remove('hidden');
    event.target.classList.add('active');
  }

  // --- Modais ---
  function showModal(id) { document.getElementById(id).classList.remove('hidden'); }
  function closeModal(id){ document.getElementById(id).classList.add('hidden'); }

  function showLevelUp(op, newLevel, stars) {
    document.getElementById('levelup-text').textContent =
      `${Levels.opLabel(op)} — agora você está no Nível ${newLevel}! 🎊`;
    const starsEl = document.getElementById('stars-earned');
    starsEl.textContent = '⭐'.repeat(stars);
    showModal('modal-levelup');
  }

  function showAchievement(icon, name) {
    document.getElementById('ach-icon').textContent = icon;
    document.getElementById('ach-name').textContent = name;
    showModal('modal-achievement');
  }

  function confirmReset() { showModal('modal-reset'); }

  // --- Feedback de resposta ---
  let _feedbackTimer = null;
  function showFeedback(text, correct) {
    const el = document.getElementById('feedback-content');
    el.textContent = text;
    el.className = 'feedback-content show';
    el.style.color = correct ? '#28A745' : '#DC3545';
    if (_feedbackTimer) clearTimeout(_feedbackTimer);
    _feedbackTimer = setTimeout(() => { el.classList.remove('show'); }, 1200);
  }

  // --- Mensagens de sequência ---
  const STREAK_MSGS = {
    5:  { text:'Muito bem! 🌟',        icon:'🌟' },
    10: { text:'Incrível! 🔥',          icon:'🔥' },
    15: { text:'Fantástico! 💫',        icon:'💫' },
    20: { text:'Você é um gênio! 🧠',  icon:'🧠' }
  };
  function getStreakMessage(streak) {
    return STREAK_MSGS[streak] || null;
  }

  // --- Atualizar barra de XP no jogo ---
  function updateXPBar(xp, xpNeeded) {
    const pct = Math.min(100, Math.round((xp / xpNeeded) * 100));
    document.getElementById('xp-bar-fill').style.width = pct + '%';
    document.getElementById('game-xp').textContent = xp;
    document.getElementById('game-xp-needed').textContent = xpNeeded;
  }

  // --- Atualizar stats no jogo ---
  function updateGameStats({ score, streak, correct, wrong, consec }) {
    document.getElementById('game-score').textContent   = score;
    document.getElementById('game-streak').textContent  = streak;
    document.getElementById('game-correct').textContent = correct;
    document.getElementById('game-wrong').textContent   = wrong;
    document.getElementById('consec-count').textContent = consec;
  }

  // --- Renderizar pergunta e botões ---
  function renderQuestion(q, options, onAnswer) {
    document.getElementById('question-text').textContent = q.text;
    const grid = document.getElementById('answers-grid');
    grid.innerHTML = '';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.textContent = opt;
      btn.setAttribute('aria-label', `Resposta ${opt}`);
      btn.onclick = () => onAnswer(opt, btn, q.answer);
      grid.appendChild(btn);
    });
  }

  // --- Feedback nos botões ---
  function markAnswer(btn, isCorrect, allBtns, correctAnswer) {
    // Desabilitar todos
    allBtns.forEach(b => { b.disabled = true; });
    if (isCorrect) {
      btn.classList.add('correct');
    } else {
      btn.classList.add('wrong');
      // Destacar correta
      allBtns.forEach(b => {
        if (parseInt(b.textContent) === correctAnswer) b.classList.add('correct');
      });
    }
  }

  // --- Atualizar avatar exibido ---
  function setAvatarDisplay(a) {
    const els = document.querySelectorAll('#home-avatar, #game-avatar');
    els.forEach(el => el.textContent = a);
  }

  // --- Atualizar toggle de som ---
  function updateSoundUI(on) {
    const icon = on ? '🔊' : '🔇';
    const el1 = document.getElementById('sound-toggle');
    const el2 = document.getElementById('sound-toggle-mini');
    if (el1) el1.textContent = icon;
    if (el2) el2.textContent = icon;
  }

  // --- Home refresh ---
  function _refreshHome() {
    document.getElementById('home-total-stars').textContent   = '⭐ ' + Storage.getTotalStars();
    document.getElementById('home-total-medals').textContent  = '🏅 ' + Storage.getTotalMedals();
    document.getElementById('home-total-trophies').textContent= '🏆 ' + Storage.getTotalTrophies();
    setAvatarDisplay(Storage.getAvatar());
    updateSoundUI(Storage.getSound());
    if (typeof Voice !== 'undefined') Voice.updateUI();
  }

  // --- Operações cards ---
  function _refreshOpCards() {
    const ops = ['add','sub','mul','div'];
    const data = Storage.get();
    ops.forEach(op => {
      const opData = data.ops[op];
      const badge = document.getElementById('op-badge-'+op);
      if (badge) badge.textContent = 'Nível ' + opData.level;
      const bar = document.getElementById('op-progress-'+op);
      if (bar) {
        const pct = ((opData.level-1) / Levels.MAX_LEVEL * 100);
        bar.style.background = `linear-gradient(90deg, var(--green) ${pct}%, #eee ${pct}%)`;
      }
    });
  }

  // --- Progress screen ---
  const OP_META = [
    { key:'add', label:'Adição ➕',         color:'var(--add-color)' },
    { key:'sub', label:'Subtração ➖',       color:'var(--sub-color)' },
    { key:'mul', label:'Multiplicação ✖️',  color:'var(--mul-color)' },
    { key:'div', label:'Divisão ➗',         color:'var(--div-color)' }
  ];

  function _refreshProgress() {
    const data = Storage.get();
    const container = document.getElementById('progress-ops');
    container.innerHTML = '';

    let totalDone = 0;
    const totalPossible = 4 * Levels.MAX_LEVEL;

    OP_META.forEach(meta => {
      const op = data.ops[meta.key];
      const card = document.createElement('div');
      card.className = 'progress-op-card';

      const header = document.createElement('div');
      header.className = 'progress-op-header';
      header.innerHTML = `<span class="progress-op-title">${meta.label}</span>
        <span style="font-size:.85rem;font-weight:700">Nível ${op.level} • XP ${op.xp}</span>`;
      card.appendChild(header);

      const row = document.createElement('div');
      row.className = 'progress-levels-row';
      for (let i = 1; i <= Levels.MAX_LEVEL; i++) {
        const stars = op.stars[i-1] || 0;
        const isDone = op.level > i;
        const isCur  = op.level === i;
        totalDone += isDone ? 1 : 0;
        const dot = document.createElement('div');
        dot.className = 'level-dot' + (isDone?' done':'') + (isCur?' cur':'');
        dot.title = `Nível ${i}`;
        if (isDone) dot.innerHTML = '⭐'.repeat(stars) || '✓';
        else dot.textContent = i;
        row.appendChild(dot);
      }
      card.appendChild(row);
      container.appendChild(card);
    });

    const pct = Math.round((totalDone / totalPossible) * 100);
    document.getElementById('overall-percent').textContent = pct + '%';
  }

  // --- Rewards screen ---
  const MEDALS_META = [
    { key:'add',    icon:'🏅', name:'Mestre da Adição',         hint:'Complete todos os níveis de Adição' },
    { key:'sub',    icon:'🥈', name:'Mestre da Subtração',      hint:'Complete todos os níveis de Subtração' },
    { key:'mul',    icon:'🥇', name:'Mestre da Multiplicação',  hint:'Complete todos os níveis de Multiplicação' },
    { key:'div',    icon:'🎖️', name:'Mestre da Divisão',        hint:'Complete todos os níveis de Divisão' },
    { key:'genius', icon:'🧠', name:'Gênio da Matemática',      hint:'Complete todas as operações' }
  ];
  const TROPHIES_META = [
    { key:'allAdd', icon:'🏆', name:'Campeão da Adição',        hint:'Todos os níveis de adição concluídos' },
    { key:'allSub', icon:'🏆', name:'Campeão da Subtração',     hint:'Todos os níveis de subtração concluídos' },
    { key:'allMul', icon:'🏆', name:'Campeão da Multiplicação', hint:'Todos os níveis de multiplicação concluídos' },
    { key:'allDiv', icon:'🏆', name:'Campeão da Divisão',       hint:'Todos os níveis de divisão concluídos' },
    { key:'allOps', icon:'👑', name:'Rei da Matemática',        hint:'Todas as operações completadas!' },
    { key:'perfect1',icon:'💎',name:'Perfeição',                hint:'5 acertos consecutivos no nível 1' }
  ];
  const ACHIEV_META = [
    { key:'streak10',  icon:'🔥', name:'10 Acertos Seguidos!',  hint:'Mantenha uma sequência de 10 acertos' },
    { key:'streak25',  icon:'💫', name:'25 Acertos Seguidos!',  hint:'Mantenha uma sequência de 25 acertos' },
    { key:'streak50',  icon:'⚡', name:'50 Acertos Seguidos!',  hint:'Mantenha uma sequência de 50 acertos' },
    { key:'streak100', icon:'🌈', name:'100 Acertos Seguidos!', hint:'Lendário! 100 acertos consecutivos' }
  ];

  function _makeRewardCards(container, items, unlockedMap) {
    container.innerHTML = '';
    items.forEach(item => {
      const unlocked = !!unlockedMap[item.key];
      const card = document.createElement('div');
      card.className = 'reward-card ' + (unlocked ? 'reward-unlocked' : 'reward-locked');
      card.title = item.hint;
      card.innerHTML = `<div class="reward-icon">${item.icon}</div>
        <div class="reward-name">${item.name}</div>`;
      container.appendChild(card);
    });
  }

  function _refreshRewards() {
    const data = Storage.get();
    _makeRewardCards(document.getElementById('tab-medals'),   MEDALS_META,  data.medals);
    _makeRewardCards(document.getElementById('tab-trophies'), TROPHIES_META,data.trophies);
    _makeRewardCards(document.getElementById('tab-achievements'),ACHIEV_META,data.achievements);
  }

  // --- Avatar screen ---
  const ALL_AVATARS = [
    { icon:'🐱', unlock:'default',    req:'Disponível desde o início' },
    { icon:'🐶', unlock:'streak10',   req:'10 acertos seguidos' },
    { icon:'🐸', unlock:'add_level2', req:'Adição: Nível 2' },
    { icon:'🦊', unlock:'sub_level2', req:'Subtração: Nível 2' },
    { icon:'🐼', unlock:'mul_level2', req:'Multiplicação: Nível 2' },
    { icon:'🐧', unlock:'div_level2', req:'Divisão: Nível 2' },
    { icon:'🦋', unlock:'streak25',   req:'25 acertos seguidos' },
    { icon:'🐉', unlock:'allOps',     req:'Complete todas as operações' },
    { icon:'🦄', unlock:'genius',     req:'Gênio da Matemática' },
    { icon:'🚀', unlock:'streak50',   req:'50 acertos seguidos' },
    { icon:'🌟', unlock:'streak100',  req:'100 acertos seguidos' },
    { icon:'👑', unlock:'perfect1',   req:'5 acertos perfeitos no nível 1' },
    { icon:'🐬', unlock:'shapes_l2',  req:'Formas: Nível 2' },
    { icon:'🦅', unlock:'shapes_l3',  req:'Formas: Nível 3' },
    { icon:'🎯', unlock:'stars30',    req:'30 estrelas conquistadas' },
    { icon:'🧙', unlock:'stars60',    req:'60 estrelas conquistadas' }
  ];

  function _refreshAvatars() {
    const unlocked = Storage.getUnlockedAvatars();
    const current  = Storage.getAvatar();
    const grid = document.getElementById('avatars-grid');
    grid.innerHTML = '';
    ALL_AVATARS.forEach(av => {
      const isUnlocked = unlocked.includes(av.icon) || av.unlock === 'default';
      const div = document.createElement('div');
      div.className = 'avatar-item' + (current === av.icon ? ' selected' : '') + (isUnlocked ? '' : ' locked');
      div.title = isUnlocked ? 'Clique para selecionar' : 'Bloqueado: ' + av.req;
      div.innerHTML = `
        <span class="avatar-emoji">${av.icon}</span>
        <span class="avatar-status ${isUnlocked ? 'unlocked' : 'locked'}">${isUnlocked ? '✅ Desbloqueado' : '🔒 Bloqueado'}</span>
        <span class="avatar-req">${av.req}</span>`;
      if (isUnlocked) {
        div.onclick = () => {
          Storage.setAvatar(av.icon);
          setAvatarDisplay(av.icon);
          _refreshAvatars();
        };
      }
      grid.appendChild(div);
    });
  }

  function getAvatarMeta() { return ALL_AVATARS; }

  // --- Parents screen ---
  function _refreshParents() {
    const stats = Storage.getStats();
    const data  = Storage.get();
    const totalQ = stats.totalCorrect + stats.totalWrong;
    const rate = totalQ > 0 ? Math.round((stats.totalCorrect / totalQ) * 100) : 0;

    // Melhor operação (mais acertos)
    const opCorrect = stats.opCorrect;
    const bestOp = Object.entries(opCorrect).sort((a,b)=>b[1]-a[1])[0];
    const bestOpLabel = bestOp ? Levels.opLabel(bestOp[0]) : '—';

    // Operação mais difícil (maior % erro)
    let hardOp = '—';
    let hardRate = -1;
    ['add','sub','mul','div'].forEach(op => {
      const t = (stats.opCorrect[op]||0) + (stats.opWrong[op]||0);
      if (t > 0) {
        const errRate = (stats.opWrong[op]||0) / t;
        if (errRate > hardRate) { hardRate = errRate; hardOp = Levels.opLabel(op); }
      }
    });

    const timeMin = Math.round((stats.totalTime || 0) / 60);

    const grid = document.getElementById('parents-grid');
    const items = [
      { label:'Tempo total',          value: timeMin + ' min' },
      { label:'Questões respondidas', value: totalQ },
      { label:'Total de acertos',     value: stats.totalCorrect },
      { label:'Total de erros',       value: stats.totalWrong,  clickable: true },
      { label:'Taxa de acerto',       value: rate + '%' },
      { label:'Melhor operação',      value: bestOpLabel },
      { label:'Maior dificuldade',    value: hardOp },
      { label:'Estrelas conquistadas',value: '⭐ ' + Storage.getTotalStars() }
    ];
    grid.innerHTML = '';
    items.forEach(it => {
      const div = document.createElement('div');
      div.className = 'parent-stat' + (it.clickable ? ' clickable' : '');
      div.innerHTML = `<div class="parent-stat-value">${it.value}</div>
        <div class="parent-stat-label">${it.label}${it.clickable ? ' (ver detalhes)' : ''}</div>`;
      if (it.clickable) div.onclick = showErrorLog;
      grid.appendChild(div);
    });

    // Evolução por operação
    const evoDiv = document.createElement('div');
    evoDiv.className = 'parent-stat full-width';
    let evoHTML = '<div class="parent-stat-label" style="margin-bottom:.5rem">Nível por operação</div>';
    ['add','sub','mul','div'].forEach(op => {
      const lv = data.ops[op].level;
      evoHTML += `<div style="display:flex;align-items:center;gap:.5rem;margin:.25rem 0">
        <span style="width:110px;font-size:.85rem">${Levels.opLabel(op)}</span>
        <div style="flex:1;height:10px;background:#eee;border-radius:5px;overflow:hidden">
          <div style="height:100%;width:${((lv-1)/Levels.MAX_LEVEL)*100}%;background:var(--green-dark);border-radius:5px"></div>
        </div>
        <span style="font-size:.85rem;font-weight:700">Nível ${lv}</span>
      </div>`;
    });
    evoDiv.innerHTML = evoHTML;
    grid.appendChild(evoDiv);
  }

  function showErrorLog() {
    const log = Storage.getErrorLog();
    const list = document.getElementById('error-log-list');
    if (!list) return;
    if (log.length === 0) {
      list.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:1rem">Nenhum erro registrado ainda! 🎉</p>';
    } else {
      list.innerHTML = log.map(e => `
        <div class="error-entry">
          <div class="err-q">${e.q}</div>
          <div class="err-detail">
            ✅ Correto: <strong>${e.correct}</strong> &nbsp;|&nbsp;
            ❌ Respondido: <strong>${e.chosen}</strong> &nbsp;|&nbsp;
            📚 ${e.op || '?'}
          </div>
          <div class="err-date">📅 ${e.date}</div>
        </div>`).join('');
    }
    showModal('modal-errors');
  }

  return {
    showScreen, showTab,
    showModal, closeModal,
    showLevelUp, showAchievement,
    showFeedback, getStreakMessage,
    updateXPBar, updateGameStats,
    renderQuestion, markAnswer,
    setAvatarDisplay, updateSoundUI,
    confirmReset, showErrorLog,
    MEDALS_META, TROPHIES_META, ACHIEV_META,
    getAvatarMeta,
    _refreshHome
  };
})();
