/* js/voice.js — Sistema de voz via SpeechSynthesis API */
'use strict';

const Voice = (() => {

  const synth = window.speechSynthesis;
  const supported = !!synth;

  // Cache de voz PT-BR
  let _voice = null;

  function _getVoice() {
    if (_voice) return _voice;
    const voices = synth.getVoices();
    // Preferência: pt-BR, depois pt, depois qualquer
    _voice = voices.find(v => v.lang === 'pt-BR')
          || voices.find(v => v.lang.startsWith('pt'))
          || voices[0]
          || null;
    return _voice;
  }

  // Carregar vozes (assíncrono no Chrome)
  if (supported) {
    synth.onvoiceschanged = () => { _voice = null; _getVoice(); };
    // Forçar carga imediata
    setTimeout(() => _getVoice(), 300);
  }

  function say(text, { rate=0.95, pitch=1.1, volume=1 } = {}) {
    if (!supported || !Storage.getVoice()) return;
    // Cancela fala anterior para não acumular fila
    synth.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang   = 'pt-BR';
    utt.rate   = rate;
    utt.pitch  = pitch;
    utt.volume = volume;
    const v = _getVoice();
    if (v) utt.voice = v;
    synth.speak(utt);
  }

  // Fix iOS: SpeechSynthesis precisa ser acionado por gesto do usuário
  function primeOnInteraction() {
    const handler = () => {
      if (supported) {
        const u = new SpeechSynthesisUtterance('');
        synth.speak(u);
      }
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('click', handler);
    };
    document.addEventListener('touchstart', handler, { once: true, passive: true });
    document.addEventListener('click', handler, { once: true });
  }
  primeOnInteraction();

  function toggle() {
    const newVal = !Storage.getVoice();
    Storage.setVoice(newVal);
    updateUI();
    if (newVal) say('Voz ativada!');
    else synth.cancel();
    return newVal;
  }

  function updateUI() {
    const on = Storage.getVoice();
    const btns = document.querySelectorAll('.voice-toggle, #voice-toggle-mini');
    btns.forEach(b => {
      b.textContent = on ? '🗣️' : '🔇';
      b.classList.toggle('off', !on);
    });
  }

  function isSupported() { return supported; }

  return { say, toggle, updateUI, isSupported };
})();
