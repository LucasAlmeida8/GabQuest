# 🌟 MatemáticaKids

Jogo educativo de matemática para crianças de 6 a 12 anos.  
100% offline · HTML5 · CSS3 · JavaScript ES6+ · Sem dependências externas

---

## 🗂️ Estrutura do Projeto

```
matematica-kids/
│
├── index.html          ← Ponto de entrada · toda a estrutura HTML
│
├── css/
│   └── style.css       ← Estilos, tema visual, animações, responsividade
│
├── js/
│   ├── storage.js      ← Leitura e escrita no LocalStorage
│   ├── levels.js       ← Configuração dos níveis por operação
│   ├── questions.js    ← Gerador de perguntas aleatórias
│   ├── ui.js           ← Manipulação do DOM, telas, modais, feedback
│   └── game.js         ← Controlador principal do fluxo do jogo
│
├── assets/
│   ├── images/         ← Imagens opcionais (o jogo usa emojis por padrão)
│   ├── sounds/         ← Sons opcionais (o jogo usa Web Audio API por padrão)
│   └── icons/          ← Ícones opcionais
│
└── README.md
```

---

## 📂 Função de cada arquivo

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Estrutura de todas as telas (home, jogo, progresso, recompensas, avatar, responsáveis), modais. |
| `css/style.css` | Paleta pastel, layout Mobile First, Flexbox/Grid, animações, responsividade. |
| `js/storage.js` | Encapsula todo acesso ao LocalStorage: salvar/carregar progresso, XP, medalhas, troféus, avatares, estatísticas. |
| `js/levels.js` | Define os 5 níveis de cada operação (limites numéricos), XP por nível, regras de progressão. |
| `js/questions.js` | Gera perguntas aleatórias sem repetição imediata e 4 alternativas (1 correta + 3 distratores). |
| `js/ui.js` | Renderiza perguntas, exibe feedback visual, navega entre telas, preenche cards de progresso/recompensas/responsáveis. |
| `js/game.js` | Orquestra o fluxo: seleção de operação → pergunta → resposta → XP → subida de nível → conquistas → persistência. |

---

## 🚀 Como executar

### Opção A — Live Server (VS Code)
1. Instale a extensão **Live Server**
2. Clique com o botão direito em `index.html`
3. Selecione **Open with Live Server**

### Opção B — Diretamente no navegador
Dê duplo clique em `index.html` — funciona sem servidor.

### Opção C — Terminal
```bash
# Python 3
python -m http.server 8080
# Abra http://localhost:8080
```

---

## 🧪 Como testar

- **Responsividade:** F12 → ícone de dispositivo móvel no Chrome
- **LocalStorage:** F12 → Application → Local Storage
- **Sons:** clique no botão 🔊 para ativar/desativar
- **Progresso:** responda 5 questões consecutivas para subir de nível
- **Reset:** Painel dos Responsáveis → botão "Resetar Progresso"

---

## 🎮 Funcionalidades

### Operações
- Adição, Subtração, Multiplicação, Divisão
- 5 níveis independentes por operação
- Dificuldade progressiva por nível

### Progressão
- 5 acertos consecutivos = sobe de nível
- Sistema de XP por operação
- Barra de progresso visual

### Recompensas
- ⭐ Estrelas por nível concluído
- 🏅 Medalhas: Mestre de cada operação + Gênio da Matemática
- 🏆 Troféus: completar todas as operações
- 🎯 Conquistas: sequências de 10, 25, 50 e 100 acertos

### Avatares
- 12 avatares desbloqueáveis via conquistas
- Seleção livre pelo jogador

### Painel dos Responsáveis
- Tempo total jogado
- Taxa de acerto
- Melhor operação / maior dificuldade
- Evolução por nível

### Sons
- Gerados via Web Audio API (sem arquivos externos)
- Ativar/desativar a qualquer momento

---

## 💾 Armazenamento

Tudo salvo no `localStorage` do navegador sob a chave `matKids_v1`.  
Limpar o cache do navegador apaga o progresso.

---

## 🌐 Compatibilidade

| Navegador | Suporte |
|---|---|
| Chrome 80+ | ✅ |
| Firefox 75+ | ✅ |
| Edge 80+ | ✅ |
| Safari 13+ | ✅ |
| Mobile (iOS/Android) | ✅ |

---

## 📦 Deploy

O projeto é estático — funciona em qualquer hospedagem:

- **Vercel:** arraste a pasta ou conecte ao GitHub
- **Netlify:** arraste a pasta em netlify.com/drop
- **GitHub Pages:** faça push e ative em Settings → Pages

---

*MatemáticaKids — aprender matemática pode (e deve!) ser divertido 🌈*
