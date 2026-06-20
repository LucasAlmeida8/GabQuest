/* js/mascote.js — Mascote interativo com frases motivacionais */
'use strict';

const Mascote = (() => {

  const FRASES = [
    'Você consegue! 💪',
    'Muito bem! 🌟',
    'Continue assim! 🚀',
    'Estou orgulhoso de você! 🥰',
    'Vamos aprender matemática! 📚',
    'Que inteligente! 🧠',
    'Você é incrível! ✨',
    'Não desista! 🔥',
    'Cada erro é um aprendizado! 📖',
    'Você vai chegar lá! 🏆',
    'Parabéns pela dedicação! 🎉',
    'Matemática é divertida! 😄',
    'Continue praticando! 💫',
    'Você é um campeão! 👑'
  ];

  let _timer = null;
  let _lastIdx = -1;

  function speak(custom) {
    const bubble = document.getElementById('mascote-bubble');
    if (!bubble) return;

    let frase = custom;
    if (!frase) {
      let idx;
      do { idx = Math.floor(Math.random() * FRASES.length); }
      while (idx === _lastIdx && FRASES.length > 1);
      _lastIdx = idx;
      frase = FRASES[idx];
    }

    bubble.textContent = frase;
    bubble.classList.add('visible');

    // Também fala via voz se habilitado
    if (typeof Voice !== 'undefined') Voice.say(frase);

    if (_timer) clearTimeout(_timer);
    _timer = setTimeout(() => bubble.classList.remove('visible'), 3000);
  }

  // Fala automático a cada 45s na home para engajar
  function _autoSpeak() {
    const screen = document.querySelector('.screen.active');
    if (screen && screen.id === 'screen-home') speak();
  }
  setInterval(_autoSpeak, 45000);

  return { speak };
})();
