/* js/shapes.js — Minijogo de Formas Geométricas */
'use strict';

const Shapes = (() => {

  // --- Definição das formas ---
  const SHAPES = [
    {
      id: 'circle', name: 'Círculo', level: 1,
      hint: 'Redondo como uma bola!',
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="42" fill="#60CBFF" stroke="#2a9fd6" stroke-width="3"/>
      </svg>`
    },
    {
      id: 'square', name: 'Quadrado', level: 1,
      hint: 'Todos os lados iguais!',
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="80" height="80" rx="4" fill="#FFD94A" stroke="#d4941a" stroke-width="3"/>
      </svg>`
    },
    {
      id: 'triangle', name: 'Triângulo', level: 1,
      hint: 'Tem 3 lados e 3 pontas!',
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,8 95,92 5,92" fill="#B8E6B0" stroke="#5aab52" stroke-width="3"/>
      </svg>`
    },
    {
      id: 'rectangle', name: 'Retângulo', level: 2,
      hint: 'Dois lados maiores e dois menores!',
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="22" width="90" height="56" rx="4" fill="#FFB3C6" stroke="#d45580" stroke-width="3"/>
      </svg>`
    },
    {
      id: 'star', name: 'Estrela', level: 2,
      hint: 'Tem 5 pontas e brilha!',
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35"
          fill="#FFD94A" stroke="#d4941a" stroke-width="2"/>
      </svg>`
    },
    {
      id: 'diamond', name: 'Losango', level: 2,
      hint: 'Parece um quadrado inclinado!',
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,5 95,50 50,95 5,50" fill="#D4B8F0" stroke="#7b52c9" stroke-width="3"/>
      </svg>`
    },
    {
      id: 'pentagon', name: 'Pentágono', level: 3,
      hint: 'Tem 5 lados iguais!',
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,5 97,38 79,93 21,93 3,38" fill="#A0D2ED" stroke="#2a9fd6" stroke-width="3"/>
      </svg>`
    },
    {
      id: 'hexagon', name: 'Hexágono', level: 3,
      hint: 'Tem 6 lados, como a colmeia das abelhas!',
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,3 93,26 93,74 50,97 7,74 7,26" fill="#B8E6B0" stroke="#5aab52" stroke-width="3"/>
      </svg>`
    },
    {
      id: 'oval', name: 'Oval', level: 3,
      hint: 'Parece um círculo achatado!',
      svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="50" rx="46" ry="30" fill="#FFB3C6" stroke="#d45580" stroke-width="3"/>
      </svg>`
    }
  ];

  // Modo: nível 1 = formas 1, nível 2 = + formas 2, nível 3 = todas
  const LEVEL_QUESTIONS = { 1:8, 2:6, 3:5 }; // acertos para avançar

  let _state = null;
  let _waiting = false;

  function _shapesForLevel(level) {
    return SHAPES.filter(s => s.level <= level);
  }

  function _rnd(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function _wrongOptions(correct, pool, count = 3) {
    const others = pool.filter(s => s.id !== correct.id);
    const picked = [];
    const shuffled = [...others].sort(() => Math.random() - .5);
    for (let i = 0; i < Math.min(count, shuffled.length); i++) picked.push(shuffled[i].name);
    // Preencher se insuficiente
    while (picked.length < count) picked.push(correct.name + '?');
    return picked;
  }

  function _shuffle(arr) {
    const a = [...arr];
    for (let i = a.length-1; i > 0; i--) {
      const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }

  // --- Tipos de pergunta por nível ---
  function _makeQuestion(level) {
    const pool = _shapesForLevel(level);
    const shape = _rnd(pool);
    const mode = level === 1 ? 'name' : _rnd(['name','sides']);

    let prompt, correct, allOpts;

    if (mode === 'name') {
      prompt = 'Qual é o nome desta forma?';
      correct = shape.name;
      allOpts = _shuffle([correct, ..._wrongOptions(shape, pool)]);
    } else if (mode === 'sides') {
      const sideMap = { circle:0, square:4, triangle:3, rectangle:4,
                        star:5, diamond:4, pentagon:5, hexagon:6, oval:0 };
      const sides = sideMap[shape.id] ?? '?';
      prompt = `Quantos lados tem esta forma?`;
      correct = String(sides);
      const wrongs = _shuffle(['2','3','4','5','6','8'].filter(n => n !== correct)).slice(0,3);
      allOpts = _shuffle([correct, ...wrongs]);
    } else {
      prompt = 'Qual é esta forma?';
      correct = shape.name;
      allOpts = _shuffle([correct, ..._wrongOptions(shape, pool)]);
    }

    return { shape, prompt, correct, options: allOpts };
  }

  function start() {
    const data  = Storage.getShapes();
    _state = {
      level:   data.level || 1,
      correct: 0,
      wrong:   0,
      streak:  0,
      consecutive: 0,
      current: null,
      sessionStart: Date.now()
    };
    _waiting = false;
    _updateTopbar();
    UI.showScreen('screen-shapes');
    _next();
  }

  // --- Função _next atualizada com a trava contra repetição ---
  function _next() {
    _waiting = false;
    
    let nextQ;
    let tries = 0;
    
    do {
      nextQ = _makeQuestion(_state.level);
      tries++;
    } while (tries < 10 && _state.current && nextQ.shape.id === _state.current.shape.id);

    _state.current = nextQ;
    _render(_state.current);
  }

  function _render(q) {
    document.getElementById('shapes-prompt').textContent = q.prompt;
    document.getElementById('shape-display').innerHTML  = q.shape.svg;
    document.getElementById('shapes-hint').textContent  = '';

    const grid = document.getElementById('shapes-answers');
    grid.innerHTML = '';
    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.textContent = opt;
      btn.onclick = () => _answer(opt, btn, q);
      grid.appendChild(btn);
    });
  }

  function _answer(chosen, btn, q) {
    if (_waiting) return;
    _waiting = true;

    const allBtns = document.querySelectorAll('#shapes-answers .answer-btn');
    const isCorrect = chosen === q.correct;

    allBtns.forEach(b => { b.disabled = true; });
    if (isCorrect) {
      btn.classList.add('correct');
      _state.correct++;
      _state.streak++;
      _state.consecutive++;
      _showFeedback('Correto! ✅', true);
      document.getElementById('shapes-hint').textContent = q.shape.hint;

      // Verificar avanço de nível
      const needed = LEVEL_QUESTIONS[_state.level] || 8;
      if (_state.consecutive >= needed && _state.level < 3) {
        setTimeout(_levelUp, 800);
        return;
      }
    } else {
      btn.classList.add('wrong');
      allBtns.forEach(b => { if (b.textContent === q.correct) b.classList.add('correct'); });
      _state.wrong++;
      _state.streak = 0;
      _state.consecutive = 0;
      _showFeedback(`Era: ${q.correct} 💡`, false);
    }

    _updateTopbar();
    _persist();
    setTimeout(_next, 1200);
  }

  function _levelUp() {
    _state.level = Math.min(3, _state.level + 1);
    _state.consecutive = 0;
    _persist();
    _updateTopbar();

    if (typeof Voice !== 'undefined') Voice.say(`Parabéns! Você chegou ao nível ${_state.level} de formas!`);
    if (typeof Mascote !== 'undefined') Mascote.speak(`Nível ${_state.level}! Você é demais! 🎉`);

    // Mini celebração visual
    const display = document.getElementById('shape-display');
    display.innerHTML = `<div style="font-size:3rem;text-align:center;animation:pop-correct .5s ease">🎉<br><span style="font-size:1rem;font-weight:900">Nível ${_state.level}!</span></div>`;
    document.getElementById('shapes-hint').textContent = '';
    document.getElementById('shapes-answers').innerHTML = '';
    document.getElementById('shapes-prompt').textContent = 'Parabéns! Subiu de nível!';

    setTimeout(_next, 1800);
  }

  function _showFeedback(text, ok) {
    const el = document.getElementById('shapes-feedback-content');
    el.textContent = text;
    el.style.color = ok ? '#28A745' : '#DC3545';
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 1100);
  }

  function _updateTopbar() {
    if (!_state) return;
    document.getElementById('shapes-level-label').textContent = 'Nível ' + _state.level;
    document.getElementById('shapes-correct').textContent     = _state.correct;
    document.getElementById('shapes-wrong').textContent       = _state.wrong;
    document.getElementById('shapes-streak').textContent      = _state.streak;
    document.getElementById('shapes-streak-chip').textContent = '🔥 ' + _state.streak;
  }

  function _persist() {
    Storage.saveShapes({
      level:   _state.level,
      correct: _state.correct,
      wrong:   _state.wrong,
      streak:  _state.streak
    });
  }

  function exit() {
    _persist();
    UI.showScreen('screen-home');
  }

  return { start, exit };
})();