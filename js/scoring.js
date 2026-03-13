// ============================================================
// LOGIQUE MÉTIER DU SIMULATEUR RH
// Indépendante de l'interface — facilement testable en isolation.
// ============================================================

// ── Profils de recommandation ────────────────────────────────
const PROFILES = {
  OFFICE_MANAGER: {
    id: 'office_manager',
    title: 'Office Manager',
    subtitle: 'Une ressource polyvalente et administrative est suffisante',
    color: 'green',
    scoreRange: '0 – 9',
  },
  HR_SHARED: {
    id: 'hr_shared',
    title: 'RH à temps partagé',
    subtitle: 'Un appui RH externe ou fractionné est recommandé',
    color: 'blue',
    scoreRange: '10 – 19',
  },
  HR_FULLTIME: {
    id: 'hr_fulltime',
    title: 'RH à temps plein',
    subtitle: 'Un poste RH internalisé à temps plein est nécessaire',
    color: 'purple',
    scoreRange: '20 – 30',
  },
};

// ── Calcul du score total ────────────────────────────────────
function getTotalScore(answers) {
  return answers.reduce((sum, a) => sum + a.score, 0);
}

// ── Recommandation principale avec règles de surclassement ──
function getRecommendation(answers) {
  const total = getTotalScore(answers);
  const scores = Object.fromEntries(answers.map(a => [a.questionId, a.score]));

  // Surclassement fort → RH Temps Plein (indépendamment du score global)
  if (scores.context === 3 || scores.hiring === 3 || total >= 20) {
    return { ...PROFILES.HR_FULLTIME, totalScore: total };
  }

  // Surclassement modéré → RH Partagé au minimum
  if (scores.headcount === 3 || scores.hr_signals === 3 || total >= 10) {
    return { ...PROFILES.HR_SHARED, totalScore: total };
  }

  return { ...PROFILES.OFFICE_MANAGER, totalScore: total };
}

// ── Niveau de maturité RH (basé sur les processus) ──────────
function getMaturityLevel(answers) {
  const processAnswer = answers.find(a => a.questionId === 'processes');
  const score = processAnswer ? processAnswer.score : 0;
  const levels = [
    { level: 1, label: 'Informel', description: 'Aucun processus formalisé' },
    { level: 2, label: 'Embryonnaire', description: 'Documents de base en place' },
    { level: 3, label: 'En structuration', description: 'Processus existants mais incomplets' },
    { level: 4, label: 'Structuré', description: 'Processus établis et en amélioration continue' },
  ];
  return levels[score];
}

// ── Signaux déclencheurs ─────────────────────────────────────
function getSignals(answers) {
  const signals = [];
  const map = Object.fromEntries(answers.map(a => [a.questionId, { score: a.score, label: a.optionLabel }]));

  if (map.headcount?.score >= 2) {
    signals.push({ type: map.headcount.score === 3 ? 'alert' : 'warning', text: `Effectif significatif : ${map.headcount.label.toLowerCase()}` });
  }
  if (map.structure?.score >= 2) {
    signals.push({ type: 'warning', text: 'Complexité organisationnelle croissante' });
  }
  if (map.growth?.score >= 2) {
    signals.push({ type: map.growth.score === 3 ? 'alert' : 'warning', text: 'Croissance des effectifs soutenue ou forte' });
  }
  if (map.hiring?.score >= 2) {
    signals.push({ type: map.hiring.score === 3 ? 'alert' : 'warning', text: `Volume de recrutement élevé : ${map.hiring.label.toLowerCase()}` });
  }
  if (map.context?.score >= 2) {
    signals.push({ type: map.context.score === 3 ? 'alert' : 'warning', text: `Contexte de transformation : ${map.context.label.toLowerCase()}` });
  }
  if (map.hr_signals?.score >= 2) {
    signals.push({ type: map.hr_signals.score === 3 ? 'alert' : 'warning', text: 'Signaux RH préoccupants détectés (turnover, tensions, désengagement)' });
  }
  if (map.legal?.score >= 2) {
    signals.push({ type: 'warning', text: 'Obligations sociales et légales actives à gérer' });
  }
  if (map.management?.score >= 2) {
    signals.push({ type: 'warning', text: 'Enjeux managériaux significatifs sans solution structurée' });
  }
  if (map.processes?.score <= 1 && answers.length >= 9) {
    signals.push({ type: 'info', text: 'Processus RH peu ou pas formalisés — risque opérationnel' });
  }

  return signals;
}

// ── Diagnostic textuel dynamique ─────────────────────────────
function getDiagnosis(answers, recommendation) {
  const scores = Object.fromEntries(answers.map(a => [a.questionId, a.score]));
  const total = getTotalScore(answers);

  if (recommendation.id === 'office_manager') {
    let text = "Votre entreprise présente un profil RH encore limité. L'essentiel de vos besoins relève de la coordination administrative et de l'organisation interne légère — des missions bien adaptées à un office manager polyvalent.";
    if (scores.growth >= 1 || scores.hiring >= 1) {
      text += " Votre croissance reste modérée, mais anticipez : dès que vos recrutements dépasseront 3 à 4 par an, un appui RH externe deviendra pertinent.";
    } else {
      text += " À ce stade, investir dans une fonction RH dédiée serait prématuré. Concentrez-vous sur la professionnalisation de vos processus administratifs de base.";
    }
    if (total >= 7) {
      text += " Votre score se situe en haut de la fourchette — restez attentif à l'évolution de vos besoins.";
    }
    return text;
  }

  if (recommendation.id === 'hr_shared') {
    let text = "Votre entreprise a de vrais enjeux RH, mais pas encore de quoi justifier un poste à temps plein. Un appui RH externe ou à temps partagé vous donnera accès à une expertise de qualité sur les sujets qui comptent — recrutement, onboarding, structuration managériale, conformité — sans le coût d'une internalisation complète.";
    if (scores.hr_signals >= 2) {
      text += " Les tensions que vous observez dans vos équipes rendent cet appui particulièrement urgent.";
    }
    if (total >= 17) {
      text += " Votre score est élevé dans cette fourchette : si votre croissance se poursuit, l'internalisation d'un RH à temps plein pourrait rapidement s'imposer.";
    }
    return text;
  }

  // hr_fulltime
  let text = "La complexité et le volume de vos enjeux RH justifient pleinement l'internalisation d'un poste RH à temps plein. ";
  if (scores.context === 3) {
    text += "Dans un contexte d'hypercroissance ou de transformation majeure, la fonction RH ne peut plus être externalisée ou fragmentée — elle doit être au cœur de votre organisation. ";
  } else if (scores.hiring === 3) {
    text += "Le volume de recrutements que vous prévoyez exige une présence RH continue et une vision à long terme. ";
  } else {
    text += "Votre taille, vos obligations légales et vos enjeux humains nécessitent une fonction RH stable et dédiée. ";
  }
  if (scores.hr_signals >= 2) {
    text += "Attention : les difficultés RH que vous observez rendent ce recrutement particulièrement urgent — agissez avant que la situation ne se dégrade davantage.";
  } else {
    text += "Un RH interne pourra construire une culture d'entreprise solide, piloter vos recrutements de bout en bout, et sécuriser votre conformité sociale.";
  }
  return text;
}

// ── Prochaines étapes concrètes ──────────────────────────────
function getNextSteps(answers, recommendation) {
  const scores = Object.fromEntries(answers.map(a => [a.questionId, a.score]));
  const steps = [];

  if (recommendation.id === 'office_manager') {
    steps.push("Formaliser vos processus administratifs de base : contrats types, suivi des congés, onboarding simplifié.");
    steps.push("Définir clairement le périmètre de l'office manager pour éviter la dispersion sur des sujets RH complexes.");
    if (scores.growth >= 1 || scores.hiring >= 1) {
      steps.push("Fixer un seuil de déclenchement RH (ex. : > 3 recrutements/an ou > 20 salariés) pour anticiper la transition.");
    } else {
      steps.push("Documenter vos pratiques actuelles pour faciliter une future montée en charge.");
    }
    return steps;
  }

  if (recommendation.id === 'hr_shared') {
    steps.push("Identifier un cabinet ou un RH indépendant spécialisé dans l'accompagnement d'entreprises en croissance.");
    steps.push("Définir les missions prioritaires du RH partagé : recrutement, onboarding, structuration managériale.");
    if (scores.legal >= 1) {
      steps.push("Réaliser un audit de conformité sociale rapide pour sécuriser vos obligations légales (CSE, DUER, etc.).");
    } else if (scores.processes <= 1) {
      steps.push("Lancer un chantier de formalisation des processus RH clés (onboarding, entretiens, off-boarding).");
    } else {
      steps.push("Poser un jalon de réévaluation dans 6 à 9 mois pour décider si l'internalisation à temps plein s'impose.");
    }
    return steps;
  }

  // hr_fulltime
  steps.push("Rédiger une fiche de poste précise pour votre futur·e RH : profil généraliste senior ou spécialiste selon vos enjeux prioritaires.");
  steps.push("Définir une roadmap RH pour les 12 premiers mois : recrutement, culture d'entreprise, conformité légale.");
  if (scores.hr_signals >= 2) {
    steps.push("Traiter en priorité les signaux RH détectés (turnover, tensions) avant ou dès l'arrivée du RH, pour éviter de l'intégrer dans un contexte dégradé.");
  } else {
    steps.push("Impliquer le futur·e RH dans la définition de la stratégie de croissance dès le premier jour — pas seulement dans l'exécution.");
  }
  return steps;
}

// ── Point d'entrée principal ──────────────────────────────────
function calculateResults(answers) {
  const recommendation = getRecommendation(answers);
  const maturity = getMaturityLevel(answers);
  const signals = getSignals(answers);
  const diagnosis = getDiagnosis(answers, recommendation);
  const nextSteps = getNextSteps(answers, recommendation);

  return {
    recommendation,
    maturity,
    signals,
    diagnosis,
    nextSteps,
    totalScore: getTotalScore(answers),
    maxScore: 30,
  };
}

// ── Cas de test (vérification manuelle) ──────────────────────
// Décommenter et ouvrir la console navigateur pour vérifier :
/*
const TEST_CASES = [
  {
    label: "Startup 8 personnes, stable",
    answers: [
      { questionId: 'headcount', score: 0, optionLabel: 'Moins de 10 personnes' },
      { questionId: 'structure', score: 0, optionLabel: '' },
      { questionId: 'growth', score: 0, optionLabel: '' },
      { questionId: 'hiring', score: 0, optionLabel: '' },
      { questionId: 'context', score: 0, optionLabel: '' },
      { questionId: 'hr_signals', score: 0, optionLabel: '' },
      { questionId: 'current_hr', score: 0, optionLabel: '' },
      { questionId: 'legal', score: 0, optionLabel: '' },
      { questionId: 'processes', score: 0, optionLabel: '' },
      { questionId: 'management', score: 0, optionLabel: '' },
    ],
    expected: 'office_manager', // score: 0
  },
  {
    label: "Scale-up 15 personnes, levée de fonds, 20 recrutements",
    answers: [
      { questionId: 'headcount', score: 1, optionLabel: '' },
      { questionId: 'structure', score: 1, optionLabel: '' },
      { questionId: 'growth', score: 3, optionLabel: '' },
      { questionId: 'hiring', score: 3, optionLabel: '' }, // override → RH Temps Plein
      { questionId: 'context', score: 2, optionLabel: '' },
      { questionId: 'hr_signals', score: 0, optionLabel: '' },
      { questionId: 'current_hr', score: 0, optionLabel: '' },
      { questionId: 'legal', score: 0, optionLabel: '' },
      { questionId: 'processes', score: 0, optionLabel: '' },
      { questionId: 'management', score: 0, optionLabel: '' },
    ],
    expected: 'hr_fulltime', // hiring=3 → override
  },
  {
    label: "PME 35 personnes, croissance modérée, quelques tensions",
    answers: [
      { questionId: 'headcount', score: 2, optionLabel: '' },
      { questionId: 'structure', score: 2, optionLabel: '' },
      { questionId: 'growth', score: 2, optionLabel: '' },
      { questionId: 'hiring', score: 2, optionLabel: '' },
      { questionId: 'context', score: 1, optionLabel: '' },
      { questionId: 'hr_signals', score: 2, optionLabel: '' },
      { questionId: 'current_hr', score: 1, optionLabel: '' },
      { questionId: 'legal', score: 1, optionLabel: '' },
      { questionId: 'processes', score: 1, optionLabel: '' },
      { questionId: 'management', score: 1, optionLabel: '' },
    ],
    expected: 'hr_shared', // score: 15
  },
];

TEST_CASES.forEach(tc => {
  const result = calculateResults(tc.answers);
  const pass = result.recommendation.id === tc.expected;
  console.log(`${pass ? '✓' : '✗'} [${tc.label}] → ${result.recommendation.id} (score: ${result.totalScore}) — attendu: ${tc.expected}`);
});
*/
