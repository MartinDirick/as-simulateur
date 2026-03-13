// ============================================================
// QUESTIONS DU SIMULATEUR RH
// Modifier les textes ici sans toucher à la logique métier.
// Chaque option a un score de 0 à 3 (croissant = besoin RH plus élevé).
// ============================================================

const QUESTIONS = [
  // ── BLOC A : Taille & Structure ──────────────────────────
  {
    id: 'headcount',
    bloc: 'A',
    blocLabel: 'Taille & Structure',
    question: 'Combien de personnes travaillent actuellement dans votre entreprise ?',
    options: [
      { label: 'Moins de 10 personnes', score: 0 },
      { label: 'Entre 10 et 25 personnes', score: 1 },
      { label: 'Entre 26 et 50 personnes', score: 2 },
      { label: 'Plus de 50 personnes', score: 3 },
    ],
  },
  {
    id: 'structure',
    bloc: 'A',
    blocLabel: 'Taille & Structure',
    question: 'Comment est organisée votre entreprise ?',
    options: [
      { label: 'Une seule équipe, peu ou pas de hiérarchie', score: 0 },
      { label: 'Quelques équipes, organisation encore très plate', score: 1 },
      { label: 'Plusieurs équipes avec des managers identifiés', score: 2 },
      { label: 'Organisation multi-niveaux ou multi-sites', score: 3 },
    ],
  },

  // ── BLOC B : Croissance & Recrutement ───────────────────
  {
    id: 'growth',
    bloc: 'B',
    blocLabel: 'Croissance & Recrutement',
    question: 'Quel est le rythme de croissance de vos effectifs cette année ?',
    options: [
      { label: 'Stable — aucune embauche significative prévue', score: 0 },
      { label: 'Modéré — 1 à 3 recrutements', score: 1 },
      { label: 'Soutenu — 4 à 10 recrutements', score: 2 },
      { label: 'Fort — plus de 10 recrutements ou levée de fonds récente', score: 3 },
    ],
  },
  {
    id: 'hiring',
    bloc: 'B',
    blocLabel: 'Croissance & Recrutement',
    question: 'Combien de postes prévoyez-vous d\'ouvrir dans les 12 prochains mois ?',
    options: [
      { label: 'Aucun ou 1 poste', score: 0 },
      { label: '2 à 4 postes', score: 1 },
      { label: '5 à 15 postes', score: 2 },
      { label: 'Plus de 15 postes', score: 3 },
    ],
  },
  {
    id: 'context',
    bloc: 'B',
    blocLabel: 'Croissance & Recrutement',
    question: 'Quel est le contexte actuel de votre entreprise ?',
    options: [
      { label: 'Situation stable, pas de transformation majeure prévue', score: 0 },
      { label: 'Phase de structuration ou premières embauches clés', score: 1 },
      { label: 'Levée de fonds, expansion géographique ou réorganisation', score: 2 },
      { label: 'Hypercroissance, internationalisation ou fusion-acquisition', score: 3 },
    ],
  },

  // ── BLOC C : Enjeux RH ──────────────────────────────────
  {
    id: 'hr_signals',
    bloc: 'C',
    blocLabel: 'Enjeux RH',
    question: 'Observez-vous des signaux RH préoccupants dans votre entreprise ?',
    options: [
      { label: 'Non — tout se passe bien, les équipes sont stables', score: 0 },
      { label: 'Quelques frictions ponctuelles d\'intégration ou de coordination', score: 1 },
      { label: 'Turnover visible, désengagement ou tensions dans les équipes', score: 2 },
      { label: 'Conflits sérieux, absences répétées ou difficultés marquées de rétention', score: 3 },
    ],
  },
  {
    id: 'current_hr',
    bloc: 'C',
    blocLabel: 'Enjeux RH',
    question: 'Qui gère actuellement les sujets RH dans votre entreprise ?',
    options: [
      { label: 'Le ou la dirigeant·e, de façon informelle et réactive', score: 0 },
      { label: 'Un office manager ou une assistante de direction', score: 1 },
      { label: 'Un prestataire externe ou un RH à temps partagé', score: 2 },
      { label: 'Un RH interne, mais débordé ou à renforcer', score: 3 },
    ],
  },
  {
    id: 'legal',
    bloc: 'C',
    blocLabel: 'Enjeux RH',
    question: 'Avez-vous des obligations sociales ou légales spécifiques à gérer ?',
    options: [
      { label: 'Non, ou elles sont gérées par notre expert-comptable', score: 0 },
      { label: 'Des élections CSE à organiser prochainement', score: 1 },
      { label: 'Un CSE actif avec des sujets courants (BDES, consultations)', score: 2 },
      { label: 'NAO, accords collectifs, pénibilité ou contentieux social', score: 3 },
    ],
  },

  // ── BLOC D : Processus & Management ─────────────────────
  {
    id: 'processes',
    bloc: 'D',
    blocLabel: 'Processus & Management',
    question: 'Comment qualifieriez-vous vos processus RH actuels ?',
    options: [
      { label: 'Rien de formalisé — on gère au cas par cas', score: 0 },
      { label: 'Quelques documents de base (contrats types, suivi des congés)', score: 1 },
      { label: 'Des processus en place mais à améliorer (onboarding, entretiens annuels)', score: 2 },
      { label: 'Des processus structurés qui demandent un suivi et une amélioration continus', score: 3 },
    ],
  },
  {
    id: 'management',
    bloc: 'D',
    blocLabel: 'Processus & Management',
    question: 'Comment qualifieriez-vous vos enjeux managériaux actuels ?',
    options: [
      { label: 'Le management est simple et fonctionne bien', score: 0 },
      { label: 'Quelques ajustements nécessaires, rien de critique', score: 1 },
      { label: 'Des problèmes identifiés sans solution structurée', score: 2 },
      { label: 'Le management est un enjeu stratégique majeur (formation, culture, conflits)', score: 3 },
    ],
  },
];
