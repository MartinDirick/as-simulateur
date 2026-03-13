// ============================================================
// APP — Gestion d'état et rendu de l'interface
// ============================================================

// ── État global ───────────────────────────────────────────────
const state = {
  screen: 'intro',       // 'intro' | 'question' | 'results'
  currentQuestion: 0,
  answers: [],           // [{ questionId, optionIndex, optionLabel, score }]
};

// ── Rendu principal ───────────────────────────────────────────
function render() {
  const app = document.getElementById('app');
  document.body.className = state.screen; // pour les styles par écran

  if (state.screen === 'intro') {
    app.innerHTML = renderIntro();
  } else if (state.screen === 'question') {
    app.innerHTML = renderQuestion();
    // Animation entrée
    requestAnimationFrame(() => {
      const screen = app.querySelector('.screen');
      if (screen) screen.classList.add('visible');
    });
  } else if (state.screen === 'results') {
    const results = calculateResults(state.answers);
    app.innerHTML = renderResults(results);
    requestAnimationFrame(() => {
      const screen = app.querySelector('.screen');
      if (screen) screen.classList.add('visible');
    });
  }

  attachEventListeners();
}

// ── Écran d'introduction ──────────────────────────────────────
function renderIntro() {
  return `
    <div class="screen intro-screen visible">
      <div class="intro-brand">
        <img src="logo ability shared.png" alt="Ability Shared" class="intro-logo">
      </div>
      <div class="intro-inner">
        <div class="intro-badge">Diagnostic RH</div>
        <h1 class="intro-title">Quel niveau de structuration RH pour votre entreprise&nbsp;?</h1>
        <p class="intro-desc">
          Répondez à 10 questions et obtenez un diagnostic personnalisé avec une recommandation claire,
          les signaux qui l'ont motivée, et vos prochaines étapes concrètes.
        </p>

        <div class="profiles-preview">
          <div class="profile-chip profile-chip--green">
            <span class="chip-dot"></span>Office Manager
          </div>
          <div class="chip-arrow">→</div>
          <div class="profile-chip profile-chip--blue">
            <span class="chip-dot"></span>RH à temps partagé
          </div>
          <div class="chip-arrow">→</div>
          <div class="profile-chip profile-chip--purple">
            <span class="chip-dot"></span>RH à temps plein
          </div>
        </div>

        <div class="intro-meta">
          <span class="meta-item"><span class="meta-icon">◷</span> 3 minutes</span>
          <span class="meta-sep">·</span>
          <span class="meta-item"><span class="meta-icon">◻</span> 10 questions</span>
          <span class="meta-sep">·</span>
          <span class="meta-item"><span class="meta-icon">◎</span> 3 profils analysés</span>
        </div>

        <button class="btn btn-primary btn-large" id="start-btn">
          Démarrer le diagnostic
          <span class="btn-arrow">→</span>
        </button>

        <p class="intro-note">Aucune donnée collectée · Résultat instantané</p>
      </div>
    </div>
  `;
}

// ── Écran de question ─────────────────────────────────────────
function renderQuestion() {
  const q = QUESTIONS[state.currentQuestion];
  const progressPct = (state.currentQuestion / QUESTIONS.length) * 100;
  const currentAnswer = state.answers[state.currentQuestion];
  const isLast = state.currentQuestion === QUESTIONS.length - 1;
  const hasAnswer = currentAnswer !== undefined;

  return `
    <div class="screen question-screen">

      <div class="q-top">
        <div class="progress-track">
          <div class="progress-fill" style="width: ${progressPct}%"></div>
        </div>
        <div class="q-header">
          <div class="q-header-left">
            <div class="bloc-label">Bloc ${q.bloc} — ${q.blocLabel}</div>
            <div class="q-counter">${state.currentQuestion + 1}<span class="q-counter-total"> / ${QUESTIONS.length}</span></div>
          </div>
          <img src="logo ability shared.png" alt="Ability Shared" class="q-logo">
        </div>
      </div>

      <div class="q-body">
        <h2 class="q-text">${q.question}</h2>
        <div class="options-list">
          ${q.options.map((opt, i) => `
            <button
              class="option-card${currentAnswer?.optionIndex === i ? ' selected' : ''}"
              data-index="${i}"
              role="radio"
              aria-checked="${currentAnswer?.optionIndex === i}"
            >
              <span class="option-radio"></span>
              <span class="option-label">${opt.label}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <div class="q-footer">
        <div class="q-nav">
          ${state.currentQuestion > 0
            ? `<button class="btn btn-ghost" id="prev-btn">← Précédent</button>`
            : `<div></div>`
          }
          <button
            class="btn btn-primary${!hasAnswer ? ' btn-disabled' : ''}"
            id="next-btn"
            ${!hasAnswer ? 'disabled' : ''}
          >
            ${isLast ? 'Voir mon diagnostic' : 'Suivant'} →
          </button>
        </div>
      </div>

    </div>
  `;
}

// ── Écran de résultats ────────────────────────────────────────
function renderResults(results) {
  const { recommendation, maturity, signals, diagnosis, nextSteps, totalScore, maxScore } = results;
  const markerPct = Math.min((totalScore / maxScore) * 100, 99);

  const signalIconMap = { alert: '◆', warning: '◈', info: '◇' };
  const signalLabelMap = { alert: 'Critique', warning: 'Attention', info: 'À noter' };

  return `
    <div class="screen results-screen visible">

      <div class="results-topbar">
        <button class="btn btn-ghost btn-sm" id="restart-btn">← Recommencer</button>
        <img src="logo ability shared.png" alt="Ability Shared" class="results-logo">
      </div>

      <!-- Recommandation principale -->
      <div class="rec-card rec-card--${recommendation.color}">
        <div class="rec-card-inner">
          <div class="rec-label">Recommandation</div>
          <h2 class="rec-title">${recommendation.title}</h2>
          <p class="rec-subtitle">${recommendation.subtitle}</p>
        </div>
        <div class="rec-score-badge">
          <span class="rec-score-num">${totalScore}</span>
          <span class="rec-score-denom">/${maxScore}</span>
        </div>
      </div>

      <!-- Spectre de position -->
      <div class="spectrum-section">
        <div class="spectrum-track">
          <div class="spectrum-zone zone-green" title="Office Manager (0–9)"></div>
          <div class="spectrum-zone zone-blue" title="RH Partagé (10–19)"></div>
          <div class="spectrum-zone zone-purple" title="RH Temps Plein (20–30)"></div>
          <div class="spectrum-marker" style="left: ${markerPct}%">
            <div class="spectrum-marker-dot"></div>
            <div class="spectrum-marker-label">${totalScore}</div>
          </div>
        </div>
        <div class="spectrum-labels">
          <span>Office Manager</span>
          <span>RH Partagé</span>
          <span>RH Temps Plein</span>
        </div>
      </div>

      <div class="results-grid">

        <!-- Diagnostic -->
        <div class="result-card">
          <div class="result-card-label">Diagnostic</div>
          <p class="diagnosis-text">${diagnosis}</p>
        </div>

        <!-- Maturité RH -->
        <div class="result-card">
          <div class="result-card-label">Maturité RH actuelle</div>
          <div class="maturity-wrap">
            <div class="maturity-top">
              <span class="maturity-num">${maturity.level}</span>
              <div>
                <div class="maturity-name">${maturity.label}</div>
                <div class="maturity-desc">${maturity.description}</div>
              </div>
            </div>
            <div class="maturity-gauge">
              ${[1, 2, 3, 4].map(n => `
                <div class="gauge-step${n <= maturity.level ? ' gauge-step--active' : ''}">
                  <div class="gauge-bar"></div>
                  <div class="gauge-tick">${n}</div>
                </div>
              `).join('')}
            </div>
            <div class="maturity-scale">
              <span>Informel</span>
              <span>Structuré</span>
            </div>
          </div>
        </div>

        ${signals.length > 0 ? `
        <!-- Signaux -->
        <div class="result-card">
          <div class="result-card-label">Signaux observés (${signals.length})</div>
          <ul class="signals-list">
            ${signals.map(s => `
              <li class="signal signal--${s.type}">
                <span class="signal-icon" title="${signalLabelMap[s.type]}">${signalIconMap[s.type]}</span>
                <span class="signal-text">${s.text}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        ` : ''}

        <!-- Prochaines étapes -->
        <div class="result-card">
          <div class="result-card-label">Prochaines étapes recommandées</div>
          <ol class="steps-list">
            ${nextSteps.map(step => `<li>${step}</li>`).join('')}
          </ol>
        </div>

      </div>

      <!-- CTA Ability Shared -->
      ${renderCTA(recommendation)}

      <div class="results-footer">
        <button class="btn btn-ghost btn-sm" id="restart-btn-bottom">Refaire le diagnostic</button>
      </div>

    </div>
  `;
}

// ── Bloc CTA Ability Shared ───────────────────────────────────
function renderCTA(recommendation) {
  const headlines = {
    office_manager: 'Votre prochaine étape, anticipée au bon moment.',
    hr_shared:      'C\'est exactement ce que nous faisons.',
    hr_fulltime:    'Nous pouvons vous accompagner dans cette transition.',
  };

  const headline = headlines[recommendation.id] || headlines.hr_shared;

  return `
    <div class="cta-block">
      <div class="cta-block-inner">
        <div class="cta-block-content">
          <div class="cta-block-eyebrow">Ability Shared</div>
          <h3 class="cta-block-title">${headline}</h3>
          <p class="cta-block-desc">
            Ability Shared accompagne les entreprises en croissance avec des solutions
            de RH à temps partagé — une expertise RH senior, activée au bon moment,
            sans les contraintes d'un poste à temps plein.
          </p>
        </div>
        <a
          href="https://abilityshared.com/prendre-rdv"
          class="btn-cta"
          target="_blank"
          rel="noopener noreferrer"
        >
          Prendre rendez-vous
          <span class="cta-arrow">→</span>
        </a>
      </div>
    </div>
  `;
}

// ── Gestion des événements ────────────────────────────────────
function attachEventListeners() {
  document.getElementById('start-btn')?.addEventListener('click', startQuiz);
  document.getElementById('prev-btn')?.addEventListener('click', prevQuestion);
  document.getElementById('next-btn')?.addEventListener('click', nextQuestion);
  document.getElementById('restart-btn')?.addEventListener('click', restart);
  document.getElementById('restart-btn-bottom')?.addEventListener('click', restart);

  document.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', () => selectOption(parseInt(card.dataset.index)));
  });
}

// ── Actions ───────────────────────────────────────────────────
function startQuiz() {
  state.screen = 'question';
  state.currentQuestion = 0;
  state.answers = [];
  render();
}

function selectOption(optionIndex) {
  const q = QUESTIONS[state.currentQuestion];
  state.answers[state.currentQuestion] = {
    questionId: q.id,
    optionIndex,
    optionLabel: q.options[optionIndex].label,
    score: q.options[optionIndex].score,
  };
  render();
}

function nextQuestion() {
  if (!state.answers[state.currentQuestion]) return;
  if (state.currentQuestion === QUESTIONS.length - 1) {
    state.screen = 'results';
  } else {
    state.currentQuestion++;
  }
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevQuestion() {
  if (state.currentQuestion > 0) {
    state.currentQuestion--;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function restart() {
  state.screen = 'intro';
  state.currentQuestion = 0;
  state.answers = [];
  render();
  window.scrollTo({ top: 0, behavior: 'instant' });
}

// ── Lancement ─────────────────────────────────────────────────
render();
