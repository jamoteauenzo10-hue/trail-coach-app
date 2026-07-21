import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";
import {
  Flag, Dumbbell, Moon, Footprints, Mountain, ChevronRight, ChevronLeft, ChevronDown,
  X, Check, AlertTriangle, Calendar, TrendingUp, BookOpen, Sparkles, Sun, CloudRain, Wind
} from "lucide-react";

/* ============================================================
   PALETTE — ThreeSixty : monochrome premium, blanc/gris/graphite
   ============================================================ */
const INK = "#151517";        // quasi-noir, texte principal / fonds sombres
const GRAPHITE = "#2B2B2E";   // gris foncé secondaire
const SILVER = "#D8D8DC";     // bordures, séparateurs
const FOG = "#EFEFF1";        // fond clair de base
const MIST = "#E7E7EA";       // cartes secondaires / séparateurs
const PAPER = "#FFFFFF";      // surfaces (cartes)
const MUTED = "#8A8A92";      // texte tertiaire (labels, légendes)
const BODY_TEXT = "#3A3A3F";  // texte de corps
const SECONDARY_TEXT = "#6B6B72"; // texte secondaire

// Accents fonctionnels (gardés, mais désaturés pour rester premium)
const TEAL = "#2B2B2E";       // accent primaire = graphite (boutons, liens actifs)
const SAND = "#A6824F";       // accent chaud désaturé (avertissement)
const CORAL = "#9B4038";      // alerte douleur (brique désaturée)
const MOSS = "#54695C";       // succès / validé (sauge désaturée)
const GOLD = "#B8965F";       // highlight discret (J- proche de la course)

const DISPLAY_FONT = "-apple-system, 'Helvetica Neue', 'Arial Black', sans-serif";
const BODY_FONT = "-apple-system, 'Inter', 'Segoe UI', sans-serif";
const MONO_FONT = "'SF Mono', 'IBM Plex Mono', 'Menlo', monospace";

/* ---- Textures : grain + trame de points, esprit ThreeSixty ---- */
function GrainOverlay() {
  return (
    <svg
      style={{
        position: "fixed", inset: 0, width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 9999, mixBlendMode: "multiply", opacity: 0.05,
      }}
    >
      <filter id="grainFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grainFilter)" />
    </svg>
  );
}
const DOT_BG = `radial-gradient(rgba(21,21,23,0.07) 1px, transparent 1.2px)`;
const dotStyle = (size = 15) => ({ backgroundImage: DOT_BG, backgroundSize: `${size}px ${size}px` });

/* ============================================================
   DONNEES DU PLAN — généré phase par phase
   ============================================================ */
function addDays(dateStr, n) {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

const TRANSITION = [
  { offset: 0, type: "renfo", title: "Renfo A — Haut du corps", details: "30-40 min.", renfoKey: "A" },
  { offset: 1, type: "course", title: "Footing très facile", km: 6, pace: "5:30-5:50/km", details: "Ajout à la demande — vraiment easy, ça s'ajoute à la récup de Quiberon, ça ne la remplace pas. Aucune ambition sur cette séance." },
  { offset: 2, type: "renfo", title: "Renfo B — Jambes / hanches", details: "30-40 min, focus moyen fessier / TFL.", renfoKey: "B" },
  { offset: 3, type: "course", title: "Sortie easy", km: 15, dplus: 100, pace: "5:20-5:40", details: "Terrain plat ou très légèrement vallonné. Aucune recherche de perf." },
];
const TRANSITION_START = "2026-07-09";

function phaseWeek({ start, label, color, days }) {
  return days.map((d, i) => ({
    date: addDays(start, i),
    phase: label,
    color,
    ...d,
  }));
}

const P = {
  sand: SAND, teal: TEAL, navy: INK, moss: MOSS, coral: CORAL, mist: "#7A8C88",
};

/* ---- Détail des exercices, référencés par renfoKey ---- */
const SEANCE_A = [
  { name: "Pompes (standard / genoux / surélevées)", sets: "3-4 × 8-15 reps", setsCount: 4, workSec: 35, restSec: 30 },
  { name: "Pompes piquées (épaules)", sets: "3 × 8-12 reps", setsCount: 3, workSec: 30, restSec: 30 },
  { name: "Dips sur chaise", sets: "3 × 10-15 reps", setsCount: 3, workSec: 30, restSec: 30 },
  { name: "Rowing élastique (ou sac à dos lesté)", sets: "3 × 12 reps", setsCount: 3, workSec: 30, restSec: 25 },
  { name: "Gainage planche + variantes latérales", sets: "3 × 30-45 sec / côté", setsCount: 3, workSec: 40, restSec: 20 },
  { name: "Superman (dos)", sets: "3 × 12 reps", setsCount: 3, workSec: 30, restSec: 20 },
];
const SEANCE_B = [
  { name: "Hip thrust unilatéral (pied surélevé)", sets: "3 × 10-12 reps / jambe", setsCount: 3, workSec: 45, restSec: 30 },
  { name: "Pont fessier", sets: "3 × 15 reps", setsCount: 3, workSec: 30, restSec: 25 },
  { name: "Step-ups (marche / chaise)", sets: "3 × 10-12 reps / jambe", setsCount: 3, workSec: 45, restSec: 30 },
  { name: "Squats bulgares (pied arrière surélevé)", sets: "3 × 8-10 reps / jambe", setsCount: 3, workSec: 45, restSec: 30 },
  { name: "Clamshells avec élastique", sets: "3 × 15-20 reps / côté", setsCount: 3, workSec: 40, restSec: 20 },
  { name: "Abduction de hanche allongé", sets: "3 × 15 reps / côté", setsCount: 3, workSec: 40, restSec: 20 },
  { name: "Fentes marchées", sets: "2 × 10 reps / jambe", setsCount: 2, workSec: 40, restSec: 25 },
  { name: "Mollets sur marche", sets: "3 × 15-20 reps", setsCount: 3, workSec: 30, restSec: 20 },
];
const SEANCE_A_LIGHT = [
  { name: "Pompes", sets: "2 × 10 reps", setsCount: 2, workSec: 25, restSec: 20 },
  { name: "Gainage planche", sets: "2 × 30 sec", setsCount: 2, workSec: 30, restSec: 15 },
  { name: "Mobilité épaules / thoracique", sets: "5 min", setsCount: 1, workSec: 300, restSec: 0 },
];
const SEANCE_B_LIGHT = [
  { name: "Clamshells avec élastique", sets: "2 × 15 reps / côté", setsCount: 2, workSec: 35, restSec: 15 },
  { name: "Pont fessier", sets: "2 × 15 reps", setsCount: 2, workSec: 25, restSec: 15 },
  { name: "Abduction de hanche allongé", sets: "2 × 12 reps / côté", setsCount: 2, workSec: 30, restSec: 15 },
];
const ACTIVATION = [
  { name: "Clamshells avec élastique", sets: "2 × 15 reps / côté", setsCount: 2, workSec: 35, restSec: 15 },
  { name: "Marche latérale élastique (monster walk)", sets: "2 × 15 pas / côté", setsCount: 2, workSec: 30, restSec: 15 },
  { name: "Pont fessier", sets: "2 × 10 reps", setsCount: 2, workSec: 25, restSec: 15 },
];
const RENFO_SETS = { A: SEANCE_A, B: SEANCE_B, A_LIGHT: SEANCE_A_LIGHT, B_LIGHT: SEANCE_B_LIGHT, ACTIVATION };
const RENFO_LABEL = {
  A: "Séance A — Haut du corps", B: "Séance B — Jambes / hanches",
  A_LIGHT: "Séance A — allégée", B_LIGHT: "Séance B — allégée",
  ACTIVATION: "Activation hanches (optionnel, sans fatigue)",
};

/* S1 figée telle que vécue (ancien rythme Mar/Jeu/Sam/Dim) */
const S1_WEEK = phaseWeek({
  start: "2026-07-13", label: "S1 — Construction", color: P.sand,
  days: [
    { type: "repos", title: "Repos complet" },
    { type: "course_renfo", title: "Course facile", km: 8, pace: "5:20-5:35/km", details: "Course d'abord, renfo le soir.", renfoKey: "A" },
    { type: "renfo", title: "Renfo B — Jambes / hanches", details: "Dédié, pas de course ce jour. Focus moyen fessier / TFL.", renfoKey: "B" },
    { type: "course", title: "Course qualité", km: 8, pace: "4:00-4:15/km", details: "15 min échauffement + 12-15 min allure soutenue + retour au calme.", blocks: [
      { label: "Échauffement", duration: "15 min", pace: "5:50-6:15/km", note: "Footing très facile, réveiller les jambes." },
      { label: "Corps de séance", duration: "12-15 min", pace: "4:00-4:15/km", note: "Effort vraiment dur — tu dois sentir que tu bosses, pas juste que ça pousse un peu. C'est ta vraie zone difficile, pas ta zone confortable de 10 km (~4:40)." },
      { label: "Retour au calme", duration: "8-10 min", pace: "5:50-6:15/km", note: "Trottiner très facile." },
    ] },
    { type: "repos", title: "Repos", details: "En option, sans fatigue :", renfoKey: "ACTIVATION" },
    { type: "course", title: "Course vallonnée", km: 8, dplus: 150, pace: "5:20-5:45/km", details: "Terrain spécifique, dénivelé progressif." },
    { type: "course", title: "Sortie longue", km: 16, dplus: 120, pace: "5:20-5:40/km", details: "Petits pas en descente, cadence rapide." },
  ],
});

/* Nouveau rythme à partir de S2 : Lun renfo B / Mar EF+renfo A / Mer qualité / Jeu repos / Ven vallonné / Sam repos / Dim longue */
const constructionV2 = (start, label, tueKm, wedDetail, wedKm, friKm, friD, sunKm, sunD, sunNote, wedPace = "4:40-4:50/km", friPace = "5:20-5:45/km", wedBlocks = null) => phaseWeek({
  start, label, color: P.sand,
  days: [
    { type: "renfo", title: "Renfo B — Jambes / hanches", details: "Dédié, pas de course ce jour. Focus moyen fessier / TFL — placé en début de semaine pour arriver frais sur le week-end.", renfoKey: "B" },
    { type: "course_renfo", title: "Course facile", km: tueKm, pace: "5:20-5:35/km", details: "Course d'abord, renfo le soir.", renfoKey: "A" },
    { type: "course", title: "Course qualité", km: wedKm, pace: wedPace, details: wedDetail, blocks: wedBlocks },
    { type: "repos", title: "Repos", details: "En option, sans fatigue :", renfoKey: "ACTIVATION" },
    { type: "course", title: "Course vallonnée", km: friKm, dplus: friD, pace: friPace, details: "Terrain spécifique, dénivelé progressif." },
    { type: "repos", title: "Repos complet" },
    { type: "course", title: "Sortie longue", km: sunKm, dplus: sunD, pace: "5:20-5:40/km", details: sunNote || "Petits pas en descente, cadence rapide." },
  ],
});

const PLAN = [
  ...S1_WEEK,
  ...constructionV2("2026-07-20", "S2 — Construction", 9, "15 min échauffement + 8 répétitions de 30-40 sec en côte courte ou escalier (effort quasi maximal), retour en trottinant entre chaque + 10 min retour au calme.", 8, 9, 175, 20, 160, "Premier test ravito léger si la sortie dépasse 1h15.", "quasi max (8-9/10 RPE)", undefined, [
    { label: "Échauffement", duration: "15 min", pace: "5:50-6:15/km", note: "Footing facile + quelques foulées dynamiques avant la première répétition." },
    { label: "Répétitions en côte", duration: "8 × 30-40 sec", pace: "quasi max (8-9/10 RPE)", note: "Sur côte courte ou escalier. Retour en trottinant/marchant entre chaque." },
    { label: "Retour au calme", duration: "10 min", pace: "5:50-6:15/km", note: "Trottiner très facile." },
  ]),
  ...constructionV2("2026-07-27", "S3 — Construction", 10, "15 min échauffement + 20-25 min à allure seuil (proche allure semi-marathon) + retour au calme.", 8, 10, 200, 25, 240, "Début officiel du protocole nutrition course : ~60 g glucides/heure dès la 2ᵉ heure.", "4:15-4:30/km", undefined, [
    { label: "Échauffement", duration: "15 min", pace: "5:50-6:15/km", note: "Footing facile, monter progressivement en allure sur la fin." },
    { label: "Bloc seuil", duration: "20-25 min", pace: "4:15-4:30/km", note: "Un cran sous ton effort vraiment dur (~4:00-4:15 sur 15 min) — tenable sur la durée, mais ça doit rester exigeant du début à la fin." },
    { label: "Retour au calme", duration: "10 min", pace: "5:50-6:15/km", note: "Trottiner très facile." },
  ]),
  ...phaseWeek({
    start: "2026-08-03", label: "S4 — Spécifique 1", color: P.navy,
    days: [
      { type: "renfo", title: "Renfo B — Jambes / hanches", details: "Dédié, placé en début de semaine avant le week-end enchaîné.", renfoKey: "B" },
      { type: "course_renfo", title: "Course facile", km: 10, pace: "5:20-5:35/km", details: "Course d'abord, renfo le soir.", renfoKey: "A" },
      { type: "course", title: "Course qualité", km: 9, pace: "quasi max (8-9/10 RPE)", details: "15 min échauffement + 10 répétitions de 30-45 sec en côte ou escalier, retour en trottinant + retour au calme.", blocks: [
        { label: "Échauffement", duration: "15 min", pace: "5:50-6:15/km", note: "Footing facile + foulées dynamiques." },
        { label: "Répétitions en côte", duration: "10 × 30-45 sec", pace: "quasi max (8-9/10 RPE)", note: "Sur côte ou escalier. Retour en trottinant entre chaque." },
        { label: "Retour au calme", duration: "10 min", pace: "5:50-6:15/km", note: "Trottiner très facile." },
      ] },
      { type: "repos", title: "Repos", details: "En option, sans fatigue :", renfoKey: "ACTIVATION" },
      { type: "course", title: "Bloc fatigue — jour 1", km: 16, dplus: 300, pace: "5:15-5:35/km", details: "Premier week-end enchaîné de la prépa, dès cette semaine." },
      { type: "repos", title: "Repos complet" },
      { type: "course", title: "Bloc fatigue — jour 2 — 30 km", km: 30, dplus: 400, pace: "5:20-5:50/km", details: "Sur jambes fatiguées de la veille, l'allure ralentit naturellement — c'est normal. Ta première sortie à 30 km. Nutrition à nouveau testée. Observer la réaction du genou en descente en fin de bloc." },
    ],
  }),
  ...phaseWeek({
    start: "2026-08-10", label: "S5 — Spécifique 2", color: P.navy,
    days: [
      { type: "renfo", title: "Renfo B — Jambes / hanches", details: "Dédié, placé en début de semaine avant le week-end enchaîné.", renfoKey: "B" },
      { type: "course_renfo", title: "Course facile", km: 9, pace: "5:20-5:35/km", details: "Raccourcir le renfo à 20 min si les jambes sont lourdes.", renfoKey: "A" },
      { type: "course", title: "Course qualité", km: 8, pace: "quasi max (8-9/10 RPE)", details: "15 min échauffement + 8-10 répétitions de 45 sec en côte ou escalier, focus fréquence de foulée + retour au calme.", blocks: [
        { label: "Échauffement", duration: "15 min", pace: "5:50-6:15/km" },
        { label: "Répétitions en côte", duration: "8-10 × 45 sec", pace: "quasi max (8-9/10 RPE)", note: "Focus fréquence de foulée. Retour en trottinant entre chaque." },
        { label: "Retour au calme", duration: "10 min", pace: "5:50-6:15/km" },
      ] },
      { type: "repos", title: "Repos", details: "En option, sans fatigue :", renfoKey: "ACTIVATION" },
      { type: "course", title: "Bloc fatigue — jour 1", km: 20, dplus: 350, pace: "5:15-5:40/km", details: "Deuxième week-end enchaîné, un cran au-dessus du précédent." },
      { type: "repos", title: "Repos complet" },
      { type: "course", title: "Bloc fatigue — jour 2 — 33 km", km: 33, dplus: 420, pace: "5:20-5:50/km", details: "Sur jambes fatiguées de la veille — normal que l'allure ralentisse. Observer la réaction du genou en descente en fin de bloc." },
    ],
  }),
  ...phaseWeek({
    start: "2026-08-17", label: "S6 — Spécifique 3 (pic)", color: P.navy,
    days: [
      { type: "renfo", title: "Renfo B — Jambes / hanches", details: "Dédié, dernière séance costaude avant le pic.", renfoKey: "B" },
      { type: "course_renfo", title: "Course facile", km: 9, pace: "5:20-5:35/km", details: "Course d'abord, renfo le soir.", renfoKey: "A" },
      { type: "course", title: "Course qualité modérée", km: 9, pace: "4:05-4:25/km", details: "15 min échauffement + 4-5 accélérations progressives de 20 sec + retour au calme. Garder de la fraîcheur pour le week-end.", blocks: [
        { label: "Échauffement", duration: "15 min", pace: "5:50-6:15/km" },
        { label: "Accélérations progressives", duration: "4-5 × 20 sec", pace: "4:05-4:25/km", note: "Vif sans aller chercher le chrono à fond sur chaque répétition — garder de la fraîcheur pour le week-end." },
        { label: "Retour au calme", duration: "8-10 min", pace: "5:50-6:15/km" },
      ] },
      { type: "repos", title: "Repos", details: "En option, sans fatigue :", renfoKey: "ACTIVATION" },
      { type: "course", title: "Vallonné très léger", km: 8, dplus: 100, pace: "5:30-5:50/km", details: "Jambes actives sans les fatiguer avant la sortie reine du lendemain." },
      { type: "repos", title: "Repos complet" },
      { type: "course", title: "Sortie longue de référence — 40 km", km: 40, dplus: 750, pace: "5:45-6:15/km sur le plat", details: "La grosse sortie de la préparation, 3 semaines avant la course pile. Ravitaillement réel (60 g glucides/h), gestion des transitions course/marche sur terrain technique. Le rythme global de la journée (marche comprise) tournera plutôt vers 6:30-7:00/km, comme le jour J. Si possible, termine sur du sable pour retrouver la sensation des 10 derniers km du parcours." },
    ],
  }),
  ...constructionV2("2026-08-24", "S7 — Décharge", 8, "15 min échauffement + 4-5 lignes droites de 20 sec + retour au calme. Intensité minimale, semaine de décharge.", 7, 8, 150, 20, 180, "Pas de recherche de performance, volume tranquille.", "libre, sans chrono", undefined, [
    { label: "Échauffement", duration: "15 min", pace: "5:50-6:15/km" },
    { label: "Lignes droites", duration: "4-5 × 20 sec", pace: "vif, sans forcer", note: "Retour marché entre chaque." },
    { label: "Retour au calme", duration: "8-10 min", pace: "5:50-6:15/km" },
  ]),
  ...phaseWeek({
    start: "2026-08-31", label: "S8 — Affûtage", color: P.mist,
    days: [
      { type: "repos", title: "Repos complet" },
      { type: "course_renfo", title: "Footing", km: 6, pace: "5:30-5:50/km", details: "Renfo allégée le soir, sans charge.", renfoKey: "A_LIGHT" },
      { type: "renfo", title: "Renfo B allégée", details: "Activation seulement, pas de charge.", renfoKey: "B_LIGHT" },
      { type: "course", title: "Footing + lignes droites", km: 5, pace: "5:30-5:50/km", details: "3-4 accélérations courtes pour garder du tonus." },
      { type: "repos", title: "Repos", details: "Vérifier le matériel : chaussures trail, ravitos, montre chargée." },
      { type: "repos", title: "Repos ou marche" },
      { type: "course", title: "Footing facile", km: 8, pace: "5:30-5:50/km", details: "Dernière sortie avant la semaine de course." },
    ],
  }),
  ...phaseWeek({
    start: "2026-09-07", label: "S9 — Semaine de course", color: P.coral,
    days: [
      { type: "course", title: "Footing très court", km: 3, pace: "5:30-5:50/km", details: "20 min, easy." },
      { type: "repos", title: "Repos ou marche" },
      { type: "course", title: "Footing + accélérations", km: 4, pace: "5:30-5:50/km", details: "20-25 min avec 2-3 accélérations courtes (10-15s)." },
      { type: "repos", title: "Repos complet" },
      { type: "repos", title: "Repos complet", details: "Préparation sac / ravitos, coucher tôt." },
      { type: "race", title: "COURSE — Trail Côte d'Émeraude", km: 54, dplus: 1200, pace: "6h00-6h30 (visé 5h45-6h15)", details: "Objectif officiel 6h00-6h30 pour la stratégie course/ravito. Scénario ambitieux si tout va bien : 5h45-6h15 (calcul km-effort ITRA : 74 km-effort, basé sur ton niveau actuel). Départ prudent, gestion des descentes en 2ᵉ moitié, nutrition 60 g glucides/h dès H2." },
    ],
  }),
];

const PLAN_BY_DATE = {};
PLAN.forEach((d) => { PLAN_BY_DATE[d.date] = d; });
TRANSITION.forEach((d) => {
  const date = addDays(TRANSITION_START, d.offset);
  PLAN_BY_DATE[date] = { date, phase: "Relance", color: P.teal, ...d };
});
const RACE_DATE = "2026-09-12";

/* ============================================================
   HISTORIQUE (saisi via Strava, pré-chargé une seule fois)
   ============================================================ */
const SEED_HISTORY = [
  { date: "2026-05-31", km: 5.52, paceSec: 327, dplus: 5, pain: 0, rpe: 4, note: "Reprise post genou, 2x15min." },
  { date: "2026-06-02", km: 9.33, paceSec: 334, dplus: 10, pain: 0, rpe: 4, note: "" },
  { date: "2026-06-06", km: 11.39, paceSec: 325, dplus: 44, pain: 0, rpe: 5, note: "Beau négative split." },
  { date: "2026-06-08", km: 10.33, paceSec: 317, dplus: 20, pain: 0, rpe: 5, note: "" },
  { date: "2026-06-15", km: 10.53, paceSec: 322, dplus: 15, pain: 0, rpe: 5, note: "Reprise après semaine chargée." },
  { date: "2026-06-17", km: 13.12, paceSec: 300, dplus: 30, pain: 0, rpe: 6, note: "Très bonne fin de course, 3e meilleur temps 10km." },
  { date: "2026-06-23", km: 5.88, paceSec: 278, dplus: 10, pain: 0, rpe: 7, note: "Effort rapide." },
  { date: "2026-06-28", km: 19.39, paceSec: 337, dplus: 442, pain: 4, rpe: 8, note: "Douleur IT band en fin de descente (300 derniers mètres). PR 10 miles." },
  { date: "2026-06-30", km: 3.24, paceSec: 369, dplus: 5, pain: 0, rpe: 2, note: "Test prudent, 0 douleur." },
  { date: "2026-07-01", km: 10.11, paceSec: 336, dplus: 45, pain: 0, rpe: 5, note: "0 douleur." },
  { date: "2026-07-04", km: 11.02, paceSec: 282, dplus: 52, pain: 0, rpe: 8, note: "Effort dur, souffert un peu, 0 douleur." },
  { date: "2026-07-08", km: 10.53, paceSec: 302, dplus: 93, pain: 0, rpe: 8, note: "Quiberon, 28°C, dur les 4 premiers km, terrain sable/sentiers." },
];

/* ============================================================
   HELPERS
   ============================================================ */
function fmtPace(sec) {
  if (!sec || !isFinite(sec)) return "—";
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
function fmtDate(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
}
function isoWeekKey(iso) {
  const d = new Date(iso + "T12:00:00");
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}
function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

/* ============================================================
   APPELS API CLAUDE — extraction de capture + commentaire coach
   ============================================================ */
async function callClaudeAPI({ system, messages }) {
  const response = await fetch("/api/claude", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, messages }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Erreur API");
  }
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
}

function parseJsonLoose(text) {
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

/* ============================================================
   MÉTÉO — Open-Meteo (gratuit, sans clé, CORS ouvert)
   ============================================================ */
const DEFAULT_COORDS = { lat: 48.117, lon: -1.677 }; // Rennes, par défaut

function getUserCoords() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(DEFAULT_COORDS);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(DEFAULT_COORDS),
      { timeout: 3000 }
    );
  });
}

async function fetchWeatherForDate(dateIso, coords) {
  const today = new Date().toISOString().slice(0, 10);
  const daysAhead = daysBetween(today, dateIso);
  const nowHour = new Date().getHours();
  try {
    let url;
    if (dateIso < today) {
      url = `https://archive-api.open-meteo.com/v1/archive?latitude=${coords.lat}&longitude=${coords.lon}&start_date=${dateIso}&end_date=${dateIso}&hourly=temperature_2m,precipitation,wind_speed_10m&timezone=Europe%2FParis`;
    } else if (daysAhead <= 15) {
      url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&start_date=${dateIso}&end_date=${dateIso}&hourly=temperature_2m,precipitation,wind_speed_10m&timezone=Europe%2FParis`;
    } else {
      return null;
    }
    const res = await fetch(url);
    const data = await res.json();
    if (!data.hourly || !data.hourly.time || data.hourly.time.length === 0) return null;
    const idx = Math.min(nowHour, data.hourly.temperature_2m.length - 1);
    return {
      temp: Math.round(data.hourly.temperature_2m[idx]),
      precip: data.hourly.precipitation[idx],
      wind: Math.round(data.hourly.wind_speed_10m[idx]),
      hour: nowHour,
    };
  } catch (e) {
    return null;
  }
}

function normalizeWeather(weather) {
  if (!weather) return null;
  return {
    temp: weather.temp ?? weather.tempMax ?? null,
    wind: weather.wind ?? weather.windMax ?? null,
    precip: weather.precip ?? 0,
  };
}
function weatherIcon(weather, size = 14) {
  const w = normalizeWeather(weather);
  if (!w || w.temp == null) return null;
  const props = { size, strokeWidth: 2 };
  if (w.precip >= 1) return <CloudRain {...props} />;
  if (w.wind >= 30) return <Wind {...props} />;
  return <Sun {...props} />;
}

function weatherLabel(weather) {
  const w = normalizeWeather(weather);
  if (!w || w.temp == null) return "";
  const parts = [`${w.temp}°`];
  if (w.wind != null) parts.push(`vent ${w.wind} km/h`);
  if (w.precip >= 1) parts.push(`${w.precip} mm pluie`);
  return parts.join(" · ");
}

/* ============================================================
   STRAVA — connexion OAuth + récupération des séances
   ============================================================ */
const STRAVA_CLIENT_ID = "266332";

function getStravaAuth() {
  try {
    const raw = localStorage.getItem("stravaAuth");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}
function setStravaAuth(auth) {
  try { localStorage.setItem("stravaAuth", JSON.stringify(auth)); } catch (e) { /* best effort */ }
}
function clearStravaAuth() {
  try { localStorage.removeItem("stravaAuth"); } catch (e) { /* best effort */ }
}
function stravaConnectUrl() {
  const redirect = window.location.origin + window.location.pathname;
  return `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirect)}&response_type=code&scope=activity:read_all&approval_prompt=auto`;
}

async function stravaApiCall(payload) {
  const res = await fetch("/api/strava", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erreur Strava");
  return data;
}

async function exchangeStravaCode(code) {
  const data = await stravaApiCall({ action: "exchange", code });
  const auth = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    athleteName: data.athlete ? `${data.athlete.firstname} ${data.athlete.lastname}` : null,
  };
  setStravaAuth(auth);
  return auth;
}

async function getValidStravaAccessToken() {
  const auth = getStravaAuth();
  if (!auth) return null;
  const now = Math.floor(Date.now() / 1000);
  if (auth.expires_at && auth.expires_at > now + 60) {
    return auth.access_token;
  }
  const data = await stravaApiCall({ action: "refresh", refresh_token: auth.refresh_token });
  const next = { ...auth, access_token: data.access_token, refresh_token: data.refresh_token, expires_at: data.expires_at };
  setStravaAuth(next);
  return next.access_token;
}

async function fetchStravaActivities(perPage = 10) {
  const token = await getValidStravaAccessToken();
  if (!token) throw new Error("Non connecté à Strava.");
  return await stravaApiCall({ action: "activities", access_token: token, per_page: perPage });
}

async function extractRunFromImages(images) {
  // images: [{ base64, mediaType }]
  const content = [
    ...images.map((img) => ({ type: "image", source: { type: "base64", media_type: img.mediaType, data: img.base64 } })),
    {
      type: "text",
      text: images.length > 1
        ? `Ces ${images.length} captures d'écran proviennent probablement de la même séance de course (résumé, détail des allures km par km, zones d'allure Z1-Z6, VAP, description avec structure d'intervalles). Combine les informations de toutes les images pour reconstituer les données les plus complètes et précises possible.`
        : "Extrait les données de cette capture d'écran, avec le maximum de détail possible.",
    },
  ];
  const text = await callClaudeAPI({
    system: `Tu extrais des données de course à pied depuis une ou plusieurs captures d'écran d'application de running (Strava ou similaire). Ces captures peuvent montrer : un résumé (distance, durée, D+, titre, date), un tableau d'allures kilomètre par kilomètre avec dénivelé, un graphique de zones d'allure (Z1 à Z6 avec pourcentages et fourchettes), une VAP (vitesse ajustée à la pente), et/ou une description texte de la séance écrite par l'athlète qui peut contenir une structure d'intervalles du type "15mn 5:40 / 15mn 4:00 / 15mn 5:10" (durée en minutes suivie d'une allure min:sec/km).

Réponds UNIQUEMENT avec un objet JSON, sans texte autour, sans balises markdown. Format exact :
{
  "title": string|null,
  "distance_km": number|null,
  "duration_sec": number|null,
  "elapsed_sec": number|null,
  "dplus_m": number|null,
  "date_iso": string|null,
  "vap_pace_sec": number|null,
  "splits": [{"km": number, "pace_sec": number, "elevation_m": number|null}]|null,
  "zones": [{"zone": string, "percent": number, "pace_range": string}]|null,
  "intervals": [{"duration_min": number, "pace_sec": number}]|null
}

Règles : tous les temps/allures en secondes. "duration_sec" est le temps de déplacement (moving time) ; "elapsed_sec" le temps total écoulé si différent et visible, sinon null. "vap_pace_sec" est l'allure VAP moyenne en secondes/km si affichée. "zones" reprend chaque ligne Z1-Z6 visible (nom de zone, pourcentage, fourchette d'allure telle qu'affichée). "intervals" reprend la structure tapée par l'athlète dans la description de l'activité si elle suit un format "Xmn allure" — un objet par ligne, dans l'ordre. "title" est le nom de l'activité. La date doit être déduite du texte visible (YYYY-MM-DD), sinon null. N'invente jamais une valeur absente : mets null. Si une valeur n'apparaît clairement que sur une seule des images, utilise-la quand même.`,
    messages: [{ role: "user", content }],
  });
  return parseJsonLoose(text);
}

function secToDurationStr(sec) {
  if (!sec) return "";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.round(sec % 60);
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

async function generateCoachComment({ plan, payload, recent, weather }) {
  const recentSummary = recent.slice(-5).map((e) =>
    `${e.date} : ${e.km} km à ${fmtPace(e.paceSec)}/km, D+${e.dplus || 0}m, douleur ${e.pain}/10`
  ).join(" | ");
  const weatherLine = weather
    ? `${weather.temp}°C, vent ${weather.wind} km/h${weather.precip >= 1 ? `, ${weather.precip}mm de pluie` : ""}`
    : "non disponible";
  const splitsLine = payload.splits && payload.splits.length > 0
    ? payload.splits.map((s) => `km${s.km}:${fmtPace(s.pace_sec)}${s.elevation_m != null ? `(${s.elevation_m > 0 ? "+" : ""}${s.elevation_m}m)` : ""}`).join(", ")
    : "non disponible";
  const zonesLine = payload.zones && payload.zones.length > 0
    ? payload.zones.map((z) => `${z.zone} ${z.percent}%`).join(", ")
    : "non disponible";
  const intervalsLine = payload.intervals && payload.intervals.length > 0
    ? payload.intervals.map((iv) => `${iv.duration_min}min à ${fmtPace(iv.pace_sec)}/km`).join(" / ")
    : null;
  const text = await callClaudeAPI({
    system: "Tu es un coach de trail expérimenté, chaleureux mais direct. Tu réponds en 2 à 4 phrases maximum, en français, sans emoji, sans markdown, sans poser de question. Tu commentes la séance à la lumière du plan prévu, de l'historique récent, de la météo du jour (une allure plus lente par forte chaleur ou grand vent n'est pas un signal d'alarme), du détail kilomètre par kilomètre (négative/positive split, régularité), des zones d'allure (répartition VO2max/seuil/endurance) et de la structure d'intervalles si l'athlète en a suivi une, en gardant en tête un antécédent de syndrome de l'essuie-glace (IT band) survenu le 28 juin après une descente en fatigue.",
    messages: [{
      role: "user",
      content: `Séance prévue : ${plan?.title || "non planifiée"}${plan?.km ? ` (${plan.km} km, ${plan.pace || ""})` : ""}.
Séance réalisée : ${payload.km} km à ${fmtPace(payload.paceSec)}/km${payload.dplus ? `, D+${payload.dplus}m` : ""}, douleur genou ${payload.pain}/10, RPE ${payload.rpe}/10.
${payload.vapPaceSec ? `VAP moyenne : ${fmtPace(payload.vapPaceSec)}/km.\n` : ""}${intervalsLine ? `Structure suivie par l'athlète : ${intervalsLine}.\n` : ""}Détail km par km : ${splitsLine}.
Zones d'allure : ${zonesLine}.
Météo du jour : ${weatherLine}.
Note de l'athlète : ${payload.note || "aucune"}.
Historique récent : ${recentSummary || "aucun"}.
Donne un commentaire de coach sur cette séance.`,
    }],
  });
  return text.trim();
}
function typeIcon(type, size = 16) {
  const props = { size, strokeWidth: 2 };
  switch (type) {
    case "repos": return <Moon {...props} />;
    case "renfo": return <Dumbbell {...props} />;
    case "course_renfo": return <Footprints {...props} />;
    case "course": return <Footprints {...props} />;
    case "race": return <Flag {...props} />;
    default: return <Footprints {...props} />;
  }
}
function typeLabel(type) {
  return { repos: "Repos", renfo: "Renfo", course_renfo: "Course + Renfo", course: "Course", race: "Course" }[type] || "Course";
}

/* ============================================================
   DÉTAIL DE SÉANCE — structure échauffement / corps / retour au calme
   ============================================================ */
function paceToSecPerKm(paceStr) {
  if (!paceStr) return null;
  const m = paceStr.match(/(\d+):(\d+)/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}
function estimateDurationLabel(km, paceStr) {
  const sec = paceToSecPerKm(paceStr);
  if (!sec || !km) return null;
  const totalMin = Math.round((sec * km) / 60);
  if (totalMin >= 60) {
    const h = Math.floor(totalMin / 60), m = totalMin % 60;
    return `~${h}h${m > 0 ? String(m).padStart(2, "0") : ""}`;
  }
  return `~${totalMin} min`;
}

function SessionDetail({ plan }) {
  const [open, setOpen] = useState(true);
  const blocks = plan.blocks || [
    { label: plan.title, duration: estimateDurationLabel(plan.km, plan.pace), pace: plan.pace, note: plan.details },
  ];
  return (
    <div style={{ marginTop: 12, borderTop: `1px solid ${SILVER}` }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "11px 0", fontSize: 12.5, fontWeight: 700, color: INK,
          textTransform: "uppercase", letterSpacing: 0.4,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Footprints size={14} /> Détail de la séance
        </span>
        <ChevronDown size={16} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>
      {open && blocks.map((b, i) => (
        <div key={i} style={{ padding: "9px 0", borderTop: `1px solid ${SILVER}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: INK }}>{b.label}</span>
            <span style={{ fontFamily: MONO_FONT, fontSize: 11.5, color: MUTED, flexShrink: 0, whiteSpace: "nowrap" }}>{b.duration}</span>
          </div>
          {b.pace && <div style={{ fontFamily: MONO_FONT, fontSize: 12, color: SAND, marginTop: 2 }}>{b.pace}</div>}
          {b.note && <div style={{ fontSize: 12, color: "#6B6B72", marginTop: 3, lineHeight: 1.4 }}>{b.note}</div>}
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   ÉCRAN DE CHARGEMENT — coureur animé
   ============================================================ */
function RunningLoader() {
  return (
    <div style={{
      fontFamily: BODY_FONT, minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", color: INK,
      background: `linear-gradient(180deg, #FCFCFD 0%, ${FOG} 60%, #E7E7EA 100%)`,
      ...dotStyle(16),
    }}>
      <GrainOverlay />
      <style>{`
        @keyframes runnerBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        @keyframes legFront { 0%,100% { transform: rotate(28deg); } 50% { transform: rotate(-24deg); } }
        @keyframes legBack { 0%,100% { transform: rotate(-24deg); } 50% { transform: rotate(28deg); } }
        @keyframes armFront { 0%,100% { transform: rotate(-30deg); } 50% { transform: rotate(26deg); } }
        @keyframes armBack { 0%,100% { transform: rotate(26deg); } 50% { transform: rotate(-30deg); } }
        @keyframes dash { to { stroke-dashoffset: -32; } }
      `}</style>
      <svg width="96" height="96" viewBox="0 0 96 96" style={{ animation: "runnerBob 0.6s ease-in-out infinite" }}>
        <circle cx="48" cy="48" r="44" fill="none" stroke={SILVER} strokeWidth="1.5" />
        <circle cx="60" cy="24" r="7" fill={INK} />
        <g transform="translate(50,32)">
          <path d="M0,0 L-3,18" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
          <g transform="translate(-3,18)" style={{ transformOrigin: "-3px 18px", animation: "legBack 0.6s ease-in-out infinite" }}>
            <path d="M0,0 L-9,16" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
          </g>
          <g transform="translate(-3,18)" style={{ transformOrigin: "-3px 18px", animation: "legFront 0.6s ease-in-out infinite" }}>
            <path d="M0,0 L11,14" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
          </g>
          <g style={{ transformOrigin: "0px 0px", animation: "armBack 0.6s ease-in-out infinite" }}>
            <path d="M0,0 L-11,10" stroke={GRAPHITE} strokeWidth="4" strokeLinecap="round" />
          </g>
          <g style={{ transformOrigin: "0px 0px", animation: "armFront 0.6s ease-in-out infinite" }}>
            <path d="M0,0 L10,9" stroke={GRAPHITE} strokeWidth="4" strokeLinecap="round" />
          </g>
        </g>
        <circle cx="18" cy="76" r="1.6" fill={SILVER}>
          <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="28" cy="80" r="1.6" fill={SILVER}>
          <animate attributeName="opacity" values="0;1;0" dur="1.2s" begin="0.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="38" cy="83" r="1.6" fill={SILVER}>
          <animate attributeName="opacity" values="0;1;0" dur="1.2s" begin="0.4s" repeatCount="indefinite" />
        </circle>
      </svg>
      <div style={{ fontFamily: DISPLAY_FONT, fontSize: 16, fontWeight: 700, marginTop: 14, letterSpacing: 0.3 }}>
        Côte d'Émeraude
      </div>
      <div style={{ fontSize: 11, color: MUTED, marginTop: 3, letterSpacing: 0.5, textTransform: "uppercase" }}>
        Préparation en cours
      </div>
    </div>
  );
}

/* ============================================================
   MINUTEUR GUIDÉ POUR LE RENFO
   ============================================================ */
function beep(freq = 880, dur = 150) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.16, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + dur / 1000);
  } catch (e) { /* audio indisponible, tant pis */ }
}

function buildTimeline(exercises) {
  const steps = [];
  exercises.forEach((ex, exIndex) => {
    const sets = ex.setsCount || 3;
    for (let s = 0; s < sets; s++) {
      steps.push({ exIndex, setIndex: s, totalSets: sets, phase: "work", duration: ex.workSec || 40, name: ex.name, display: ex.sets });
      const isLastOverall = exIndex === exercises.length - 1 && s === sets - 1;
      if (!isLastOverall && ex.restSec > 0) {
        steps.push({ exIndex, setIndex: s, totalSets: sets, phase: "rest", duration: ex.restSec || 20, name: ex.name, display: ex.sets });
      }
    }
  });
  return steps;
}

function estimateDuration(exercises) {
  const steps = buildTimeline(exercises);
  const totalSec = steps.reduce((sum, s) => sum + s.duration, 0);
  return Math.round(totalSec / 60);
}

function WorkoutTimer({ exercises, label, onExit }) {
  const timeline = useMemo(() => buildTimeline(exercises), [exercises]);
  const [stepIdx, setStepIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(timeline[0]?.duration || 0);
  const [running, setRunning] = useState(true);
  const done = stepIdx >= timeline.length;
  const step = timeline[stepIdx];

  useEffect(() => {
    setSecondsLeft(timeline[stepIdx]?.duration || 0);
  }, [stepIdx, timeline]);

  useEffect(() => {
    if (!running || done) return;
    if (secondsLeft <= 0) {
      beep(step?.phase === "work" ? 720 : 1000);
      setStepIdx((i) => i + 1);
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, running, done, step]);

  const overlayStyle = {
    position: "fixed", inset: 0, background: `linear-gradient(160deg, ${INK}, ${GRAPHITE})`,
    zIndex: 10000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    color: "white", padding: "env(safe-area-inset-top) 20px env(safe-area-inset-bottom)",
  };
  const circleBtnStyle = {
    background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.25)", color: "white",
    borderRadius: 24, padding: "12px 22px", fontSize: 14, fontWeight: 600, cursor: "pointer",
  };

  if (done) {
    return (
      <div style={overlayStyle}>
        <Check size={44} color="white" />
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: 22, fontWeight: 900, marginTop: 14 }}>Séance terminée</div>
        <div style={{ fontSize: 12.5, opacity: 0.6, marginTop: 4 }}>Bien joué.</div>
        <button onClick={onExit} style={{ ...circleBtnStyle, marginTop: 26 }}>Fermer</button>
      </div>
    );
  }

  const nextStep = timeline[stepIdx + 1];
  return (
    <div style={overlayStyle}>
      <button onClick={onExit} style={{ position: "absolute", top: "calc(20px + env(safe-area-inset-top))", right: 20, background: "none", border: "none", color: "white", opacity: 0.7 }}>
        <X size={22} />
      </button>
      <div style={{ fontSize: 11, opacity: 0.55, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      <div style={{
        fontFamily: DISPLAY_FONT, fontSize: 23, fontWeight: 900, marginTop: 8, textAlign: "center",
        padding: "0 12px", lineHeight: 1.1,
      }}>
        {step.name}
      </div>
      <div style={{ fontSize: 13, opacity: 0.65, marginTop: 6 }}>
        Série {step.setIndex + 1}/{step.totalSets} · {step.phase === "work" ? "Travail" : "Repos"} · {step.display}
      </div>
      <div style={{
        fontFamily: MONO_FONT, fontSize: 76, fontWeight: 700, marginTop: 22,
        color: step.phase === "rest" ? "#B8C4C0" : "white",
      }}>
        {secondsLeft}
      </div>
      <div style={{ fontSize: 12, opacity: 0.5, marginTop: 12, minHeight: 16 }}>
        {nextStep ? `Suivant : ${nextStep.phase === "work" ? nextStep.name : "repos"}` : "Dernière étape"}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
        <button onClick={() => setRunning((r) => !r)} style={circleBtnStyle}>{running ? "Pause" : "Reprendre"}</button>
        <button onClick={() => setStepIdx((i) => i + 1)} style={circleBtnStyle}>Passer →</button>
      </div>
    </div>
  );
}

/* ============================================================
   SIGNATURE — profil de la préparation (silhouette de côte)
   ============================================================ */
function PrepProfile({ today, entries }) {
  const weeks = useMemo(() => {
    const byWeek = {};
    Object.values(PLAN_BY_DATE).forEach((d) => {
      const wk = isoWeekKey(d.date);
      const dp = d.dplus || 0;
      byWeek[wk] = (byWeek[wk] || 0) + dp;
    });
    return Object.entries(byWeek).sort((a, b) => a[0].localeCompare(b[0]));
  }, []);

  const w = 320, h = 72, pad = 6;
  const max = Math.max(...weeks.map((w) => w[1]), 1);
  const stepX = (w - pad * 2) / Math.max(weeks.length - 1, 1);
  const pts = weeks.map(([wk, val], i) => {
    const x = pad + i * stepX;
    const y = h - pad - (val / max) * (h - pad * 2 - 14);
    return [x, y];
  });
  const pathD = pts.reduce((acc, [x, y], i) => acc + (i === 0 ? `M${x},${y}` : ` L${x},${y}`), "");
  const areaD = pathD + ` L${pts[pts.length - 1][0]},${h} L${pts[0][0]},${h} Z`;

  const todayWk = isoWeekKey(today);
  let todayIdx = weeks.findIndex(([wk]) => wk === todayWk);
  if (todayIdx < 0) todayIdx = today < weeks[0]?.[0] ? 0 : weeks.length - 1;
  const todayX = pad + todayIdx * stepX;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ display: "block" }}>
      <defs>
        <linearGradient id="profileFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={INK} stopOpacity="0.28" />
          <stop offset="100%" stopColor={INK} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#profileFill)" />
      <path d={pathD} fill="none" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      <line x1={todayX} y1={4} x2={todayX} y2={h - 4} stroke={INK} strokeWidth="1" strokeDasharray="2,2" opacity="0.4" />
      <circle cx={todayX} cy={pts[todayIdx]?.[1] ?? h / 2} r="3.2" fill={INK} />
      <g transform={`translate(${w - pad - 6}, 10)`}>
        <path d="M0,0 L0,16 M0,0 L9,3 L0,6" fill="none" stroke={CORAL} strokeWidth="1.6" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/* ============================================================
   COMPOSANT PRINCIPAL
   ============================================================ */
export default function TrailPrepApp() {
  const [ready, setReady] = useState(false);
  const [entries, setEntries] = useState({});
  const [tab, setTab] = useState("today");
  const [cursor, setCursor] = useState(() => new Date().toISOString().slice(0, 10));
  const [formOpen, setFormOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [coachComment, setCoachComment] = useState(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [stravaAuth, setStravaAuthState] = useState(() => getStravaAuth());
  const [stravaActivities, setStravaActivities] = useState(null);

  useEffect(() => {
    if (!stravaAuth) return;
    fetchStravaActivities(30).then(setStravaActivities).catch(() => {});
  }, [stravaAuth]);

  const [stravaConnectError, setStravaConnectError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const oauthError = params.get("error");
    if (oauthError) {
      setStravaConnectError(`Strava a renvoyé une erreur : ${oauthError}`);
      window.history.replaceState({}, "", window.location.pathname);
      return;
    }
    if (code) {
      exchangeStravaCode(code)
        .then((auth) => setStravaAuthState(auth))
        .catch((e) => setStravaConnectError(e.message || "Échec de la connexion Strava."))
        .finally(() => {
          window.history.replaceState({}, "", window.location.pathname);
        });
    }
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem("traildata");
    if (raw) {
      try {
        const data = JSON.parse(raw);
        setEntries(data.entries || {});
      } catch (e) {
        setEntries({});
      }
    } else {
      const seeded = {};
      SEED_HISTORY.forEach((h) => { seeded[h.date] = h; });
      try {
        localStorage.setItem("traildata", JSON.stringify({ entries: seeded }));
      } catch (e) { /* best effort */ }
      setEntries(seeded);
    }
    setReady(true);
  }, []);

  function persist(next) {
    setEntries(next);
    try {
      localStorage.setItem("traildata", JSON.stringify({ entries: next }));
    } catch (e) {
      setSaveError(true);
    }
  }

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const dayPlan = PLAN_BY_DATE[cursor] || null;
  const daysToRace = daysBetween(todayIso, RACE_DATE);
  const logged = entries[cursor];

  useEffect(() => {
    let cancelled = false;
    setWeather(null);
    setWeatherLoading(true);
    (async () => {
      const coords = cursor === todayIso ? await getUserCoords() : DEFAULT_COORDS;
      const w = await fetchWeatherForDate(cursor, coords);
      if (!cancelled) {
        setWeather(w);
        setWeatherLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [cursor, todayIso]);

  function goDay(delta) {
    setCursor((c) => addDays(c, delta));
    setFormOpen(false);
    setFeedback(null);
    setCoachComment(null);
  }

  async function submitLog(payload) {
    const withWeather = { ...payload, weather };
    const next = { ...entries, [cursor]: { date: cursor, ...withWeather } };
    persist(next);
    setFeedback(computeFeedback(dayPlan, withWeather));
    setFormOpen(false);
    setCoachComment(null);
    setCoachLoading(true);
    try {
      const recent = Object.values(next).sort((a, b) => a.date.localeCompare(b.date));
      const comment = await generateCoachComment({ plan: dayPlan, payload: withWeather, recent, weather });
      setCoachComment(comment);
    } catch (e) {
      // Dégradation silencieuse : le feedback basé sur les règles reste affiché.
    } finally {
      setCoachLoading(false);
    }
  }

  function computeFeedback(plan, payload) {
    const msgs = [];
    if (payload.pain > 0) {
      msgs.push({
        tone: "alert",
        text: payload.pain >= 5
          ? "Douleur marquée signalée. Coupe le dénivelé et les descentes des prochaines sorties, et recontacte ton kiné si ça ne s'améliore pas rapidement."
          : "Petite gêne signalée — reste vigilant sur les prochaines sorties à dénivelé. Si ça persiste ou s'aggrave, c'est le moment de revoir ton kiné.",
      });
    } else {
      msgs.push({ tone: "good", text: "Aucune douleur signalée — bon signal, continue comme ça." });
    }
    if (plan && plan.pace && /\d/.test(plan.pace) === false && payload.paceSec && plan.type === "course_renfo" || (plan && plan.pace === "5:20-5:35")) {
      if (payload.paceSec && payload.paceSec < 300) {
        msgs.push({ tone: "warn", text: "C'était prévu en facile, et l'allure est plutôt soutenue. Pas grave ponctuellement, mais attention à ne pas transformer trop souvent les sorties easy en séances qualité — la récupération en pâtit." });
      }
    }
    if (plan && plan.km && payload.km && payload.km > plan.km * 1.25) {
      msgs.push({ tone: "warn", text: `Distance nettement au-dessus du prévu (${plan.km} km programmés). Ok ponctuellement si les sensations étaient bonnes, à ne pas systématiser.` });
    }
    if (plan && plan.dplus && payload.dplus && payload.dplus > plan.dplus * 1.3) {
      msgs.push({ tone: "warn", text: "Dénivelé au-dessus de ce qui était prévu cette semaine — à surveiller vu l'historique." });
    }
    if (payload.weather) {
      const w = payload.weather;
      if (w.temp >= 24) {
        msgs.push({ tone: "good", text: `Il faisait chaud pendant cette séance (${w.temp}°C) — une allure un peu plus lente que prévu s'explique très bien par la météo, pas d'inquiétude à avoir.` });
      } else if (w.wind >= 30) {
        msgs.push({ tone: "good", text: `Vent soutenu pendant cette séance (${w.wind} km/h) — ça pèse sur l'allure et le ressenti, à prendre en compte avant de comparer avec d'autres séances.` });
      }
    }
    if (msgs.length === 1 && msgs[0].tone === "good") {
      msgs.push({ tone: "good", text: "Séance cohérente avec le plan. Bien joué." });
    }
    return msgs;
  }

  if (!ready) {
    return <RunningLoader />;
  }

  return (
    <div style={{
      fontFamily: BODY_FONT, color: INK, minHeight: "100vh",
      background: `linear-gradient(180deg, #FCFCFD 0%, ${FOG} 45%, #E7E7EA 100%)`,
      paddingBottom: "calc(78px + env(safe-area-inset-bottom))",
    }}>
      <GrainOverlay />
      {/* HEADER */}
      <div style={{
        padding: "calc(14px + env(safe-area-inset-top)) 20px 16px",
        paddingLeft: "calc(20px + env(safe-area-inset-left))",
        paddingRight: "calc(20px + env(safe-area-inset-right))",
        borderBottom: `1px solid ${SILVER}`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{
            fontFamily: DISPLAY_FONT, fontWeight: 900, fontSize: 26, letterSpacing: "-0.02em",
            lineHeight: 1.02, color: INK,
          }}>
            Côte<br/>d'Émeraude.
          </div>
          <div style={{ textAlign: "right", paddingTop: 3 }}>
            <div style={{ fontFamily: MONO_FONT, fontSize: 26, fontWeight: 700, color: daysToRace <= 14 ? CORAL : INK, lineHeight: 1 }}>
              J-{daysToRace}
            </div>
            <div style={{ fontSize: 10, color: MUTED, marginTop: 4, letterSpacing: 0.3 }}>12 SEPT · 54KM</div>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <PrepProfile today={cursor} entries={entries} />
        </div>
      </div>

      {/* TABS CONTENT */}
      {tab === "today" && (
        <TodayView
          cursor={cursor} goDay={goDay} plan={dayPlan} logged={logged}
          formOpen={formOpen} setFormOpen={setFormOpen}
          submitLog={submitLog} feedback={feedback} isToday={cursor === todayIso}
          coachComment={coachComment} coachLoading={coachLoading}
          weather={weather} weatherLoading={weatherLoading}
          stravaActivities={stravaActivities}
        />
      )}
      {tab === "journal" && <JournalView entries={entries} onImportEntries={persist} stravaConnectError={stravaConnectError} />}
      {tab === "suivi" && <SuiviView entries={entries} />}

      {saveError && (
        <div style={{ position: "fixed", bottom: 74, left: 12, right: 12, background: CORAL, color: "white", padding: "8px 12px", borderRadius: 10, fontSize: 12.5, textAlign: "center" }}>
          Sauvegarde impossible pour le moment — réessaie dans un instant.
        </div>
      )}

      {/* BOTTOM NAV */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        borderTop: `1px solid ${SILVER}`, display: "flex",
        padding: "8px 6px calc(10px + env(safe-area-inset-bottom))",
      }}>
        {[
          { id: "today", label: "Aujourd'hui", icon: Calendar },
          { id: "journal", label: "Journal", icon: BookOpen },
          { id: "suivi", label: "Suivi", icon: TrendingUp },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              background: "none", border: "none", padding: "6px 0",
              color: tab === id ? INK : "#ACACB2", cursor: "pointer",
            }}
          >
            <Icon size={20} strokeWidth={tab === id ? 2.4 : 1.8} />
            <span style={{ fontSize: 10.5, fontWeight: tab === id ? 600 : 400 }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   VUE — AUJOURD'HUI
   ============================================================ */
function TodayView({ cursor, goDay, plan, logged, formOpen, setFormOpen, submitLog, feedback, isToday, coachComment, coachLoading, weather, weatherLoading, stravaActivities }) {
  const runnable = plan && (plan.type === "course" || plan.type === "course_renfo" || plan.type === "race");
  const [prefillActivity, setPrefillActivity] = useState(null);
  const stravaMatch = !logged && runnable && stravaActivities
    ? stravaActivities.find((a) => (a.start_date_local || "").slice(0, 10) === cursor)
    : null;
  return (
    <div style={{ padding: "18px", paddingLeft: "calc(18px + env(safe-area-inset-left))", paddingRight: "calc(18px + env(safe-area-inset-right))" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <button onClick={() => goDay(-1)} style={navBtnStyle}><ChevronLeft size={18} /></button>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>{fmtDate(cursor)}</div>
          {!isToday && <div style={{ fontSize: 10.5, color: TEAL, cursor: "pointer" }} onClick={() => goDay(daysBetween(cursor, new Date().toISOString().slice(0, 10)))}>revenir à aujourd'hui</div>}
        </div>
        <button onClick={() => goDay(1)} style={navBtnStyle}><ChevronRight size={18} /></button>
      </div>

      {(weatherLoading || weather) && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: MUTED,
          marginBottom: 10, justifyContent: "center",
        }}>
          {weatherLoading ? "Météo…" : (<>{weatherIcon(weather)} {weatherLabel(weather)}</>)}
        </div>
      )}

      {!plan && (
        <Card>
          <div style={{ fontSize: 13.5, color: "#6B6B72" }}>Pas de séance planifiée à cette date (hors période de préparation).</div>
        </Card>
      )}

      {plan && (
        <Card accent={plan.color}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ background: plan.color, color: "white", width: 30, height: 30, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {typeIcon(plan.type, 16)}
            </div>
            <div>
              <div style={{ fontSize: 10.5, color: "#8A8A92", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6 }}>{plan.phase}</div>
              <div style={{ fontFamily: DISPLAY_FONT, fontSize: 23, fontWeight: 900, letterSpacing: "-0.015em", lineHeight: 1.05 }}>{plan.title}</div>
            </div>
          </div>

          {(plan.km || plan.dplus) && (
            <div style={{ display: "flex", gap: 18, margin: "12px 0 6px" }}>
              {plan.km && <Stat label="Distance" value={`${plan.km} km`} />}
              {plan.dplus && <Stat label="D+" value={`${plan.dplus} m`} />}
              {plan.pace && <Stat label="Allure" value={plan.pace} />}
            </div>
          )}

          {(plan.type === "course" || plan.type === "course_renfo" || plan.type === "race") && <SessionDetail plan={plan} />}
          {(plan.type === "renfo" || plan.type === "repos") && plan.details && <p style={{ fontSize: 13, lineHeight: 1.5, color: "#3A3A3F", marginTop: 8 }}>{plan.details}</p>}
          {plan.renfoKey && <RenfoDetail renfoKey={plan.renfoKey} />}

          {stravaMatch && !formOpen && (
            <div style={{ marginTop: 12, background: "#FFF3EC", border: "1px solid #FC5200", borderRadius: 12, padding: "10px 12px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#FC5200", marginBottom: 3 }}>🔗 Séance Strava détectée</div>
              <div style={{ fontSize: 12, color: BODY_TEXT, marginBottom: 8 }}>
                {stravaMatch.name || "Course"} — {(stravaMatch.distance / 1000).toFixed(2)} km, {secToDurationStr(stravaMatch.moving_time)}
              </div>
              <button onClick={() => { setPrefillActivity(stravaMatch); setFormOpen(true); }} style={{
                background: "#FC5200", color: "white", border: "none", borderRadius: 9, padding: "8px 0",
                width: "100%", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
              }}>
                Logger cette séance
              </button>
            </div>
          )}

          {runnable && !logged && !formOpen && (
            <button onClick={() => setFormOpen(true)} style={primaryBtnStyle}>
              Enregistrer cette séance
            </button>
          )}
          {runnable && logged && (
            <LoggedSummary entry={logged} />
          )}
        </Card>
      )}

      {formOpen && plan && (
        <LogForm plan={plan} cursor={cursor} onCancel={() => setFormOpen(false)} onSubmit={submitLog} prefillActivity={prefillActivity} />
      )}

      {feedback && (
        <Card>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#8A8A92", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
            <Sparkles size={13} /> Analyse
          </div>
          {feedback.map((f, i) => (
            <div key={i} style={{
              display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13, lineHeight: 1.4,
              padding: "7px 0", borderTop: i > 0 ? `1px solid ${MIST}` : "none",
              color: f.tone === "alert" ? CORAL : f.tone === "warn" ? SAND : MOSS,
            }}>
              {f.tone === "alert" ? <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} /> : <Check size={15} style={{ flexShrink: 0, marginTop: 1 }} />}
              <span>{f.text}</span>
            </div>
          ))}
        </Card>
      )}

      {(coachLoading || coachComment) && (
        <Card>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#8A8A92", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
            <Sparkles size={13} /> Commentaire du coach
          </div>
          {coachLoading && <div style={{ fontSize: 13, color: "#8A8A92", fontStyle: "italic" }}>Analyse en cours…</div>}
          {!coachLoading && coachComment && <p style={{ fontSize: 13.5, lineHeight: 1.5, color: "#3A3A3F", margin: 0 }}>{coachComment}</p>}
        </Card>
      )}
    </div>
  );
}

function RenfoDetail({ renfoKey }) {
  const [open, setOpen] = useState(false);
  const [launched, setLaunched] = useState(false);
  const list = RENFO_SETS[renfoKey];
  if (!list) return null;
  const duration = estimateDuration(list);
  return (
    <div style={{ marginTop: 12, borderTop: `1px solid ${SILVER}` }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "11px 0", fontSize: 12.5, fontWeight: 700, color: INK,
          textTransform: "uppercase", letterSpacing: 0.4,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <Dumbbell size={14} /> {RENFO_LABEL[renfoKey]}
        </span>
        <ChevronDown size={16} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>
      {open && (
        <>
          {list.map((ex, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12.5, padding: "8px 0",
              borderTop: `1px solid ${SILVER}`,
            }}>
              <span style={{ color: BODY_TEXT }}>{ex.name}</span>
              <span style={{ fontFamily: MONO_FONT, color: MUTED, flexShrink: 0, whiteSpace: "nowrap" }}>{ex.sets}</span>
            </div>
          ))}
          <button onClick={() => setLaunched(true)} style={{ ...primaryBtnStyle, marginTop: 12, padding: "10px 0", fontSize: 13 }}>
            Lancer la séance (~{duration} min)
          </button>
          <div style={{ fontSize: 10.5, color: MUTED, marginTop: 6, textAlign: "center" }}>
            Durées indicatives — adapte à ton rythme, tu peux passer une étape à tout moment.
          </div>
        </>
      )}
      {launched && <WorkoutTimer exercises={list} label={RENFO_LABEL[renfoKey]} onExit={() => setLaunched(false)} />}
    </div>
  );
}

function LoggedSummary({ entry }) {
  return (
    <div style={{ marginTop: 12, borderTop: `1px solid ${MIST}`, paddingTop: 10 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: MOSS, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>Enregistré</div>
      <div style={{ display: "flex", gap: 18 }}>
        <Stat label="Distance" value={`${entry.km} km`} />
        <Stat label="Allure" value={fmtPace(entry.paceSec) + "/km"} />
        {!!entry.dplus && <Stat label="D+" value={`${entry.dplus} m`} />}
        <Stat label="Douleur" value={entry.pain === 0 ? "Aucune" : `${entry.pain}/10`} tone={entry.pain > 0 ? CORAL : MOSS} />
      </div>
      {entry.note && <p style={{ fontSize: 12.5, color: "#6B6B72", marginTop: 8, fontStyle: "italic" }}>« {entry.note} »</p>}
      {entry.weather && (
        <div style={{ fontSize: 11.5, color: MUTED, marginTop: 8, display: "flex", alignItems: "center", gap: 5 }}>
          {weatherIcon(entry.weather)} {weatherLabel(entry.weather)}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div>
      <div style={{ fontFamily: MONO_FONT, fontSize: 15, fontWeight: 700, color: tone || INK }}>{value}</div>
      <div style={{ fontSize: 9.5, color: "#8A8A92", textTransform: "uppercase", letterSpacing: 0.3 }}>{label}</div>
    </div>
  );
}

function Card({ children, accent }) {
  return (
    <div style={{
      background: PAPER, borderRadius: 16, padding: 18, marginBottom: 14,
      border: `1px solid ${SILVER}`,
      borderLeft: accent ? `3px solid ${accent}` : `1px solid ${SILVER}`,
      boxShadow: "0 1px 2px rgba(21,21,23,0.03)",
    }}>
      {children}
    </div>
  );
}

const navBtnStyle = {
  background: PAPER, border: `1px solid ${SILVER}`, borderRadius: 10, width: 34, height: 34,
  display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: INK,
};
const primaryBtnStyle = {
  marginTop: 14, width: "100%", background: `linear-gradient(160deg, ${INK}, ${GRAPHITE})`, color: "white", border: "none",
  borderRadius: 13, padding: "12px 0", fontSize: 14, fontWeight: 600, cursor: "pointer",
  letterSpacing: 0.2, boxShadow: "0 4px 14px rgba(21,21,23,0.22)",
};

/* ============================================================
   FORMULAIRE DE SAISIE
   ============================================================ */
function LogForm({ plan, cursor, onCancel, onSubmit, prefillActivity }) {
  const [km, setKm] = useState(plan.km || "");
  const [duration, setDuration] = useState("");
  const [dplus, setDplus] = useState(plan.dplus || "");
  const [pain, setPain] = useState(0);
  const [rpe, setRpe] = useState(5);
  const [note, setNote] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState(null);
  const [dateWarning, setDateWarning] = useState(null);
  const [filledCount, setFilledCount] = useState(0);
  const [extractedExtra, setExtractedExtra] = useState(null);
  const [stravaList, setStravaList] = useState(null);
  const [stravaLoading, setStravaLoading] = useState(false);
  const [stravaError, setStravaError] = useState(null);

  useEffect(() => {
    if (prefillActivity) pickStravaActivity(prefillActivity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleStravaImport() {
    if (stravaList) { setStravaList(null); return; }
    setStravaLoading(true);
    setStravaError(null);
    try {
      const data = await fetchStravaActivities(10);
      setStravaList(Array.isArray(data) ? data : []);
    } catch (e) {
      setStravaError("Import impossible — vérifie que Strava est bien connecté (onglet Journal).");
    } finally {
      setStravaLoading(false);
    }
  }

  function pickStravaActivity(a) {
    setKm(String(Math.round((a.distance / 1000) * 100) / 100));
    setDuration(secToDurationStr(a.moving_time));
    setDplus(String(Math.round(a.total_elevation_gain || 0)));
    setExtractedExtra({ title: a.name || null, splits: null, zones: null, intervals: null, vapPaceSec: null, elapsedSec: a.elapsed_time || null });
    const activityDate = (a.start_date_local || "").slice(0, 10);
    if (activityDate && activityDate !== cursor) {
      setDateWarning(`Cette séance Strava date du ${fmtDate(activityDate)} — tu es sur le ${fmtDate(cursor)}. Vérifie que c'est le bon jour avant de valider.`);
    } else {
      setDateWarning(null);
    }
    setStravaList(null);
  }

  function parseDuration(str) {
    const parts = str.split(":").map((p) => parseInt(p, 10));
    if (parts.some(isNaN)) return null;
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return null;
  }

  async function handleImage(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setExtracting(true);
    setExtractError(null);
    setDateWarning(null);
    try {
      const images = await Promise.all(files.map((file) => new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve({ base64: r.result.split(",")[1], mediaType: file.type || "image/jpeg" });
        r.onerror = () => reject(new Error("Lecture impossible"));
        r.readAsDataURL(file);
      })));
      const data = await extractRunFromImages(images);
      if (data.distance_km) setKm(String(data.distance_km));
      if (data.duration_sec) setDuration(secToDurationStr(data.duration_sec));
      if (data.dplus_m != null) setDplus(String(data.dplus_m));
      if (data.date_iso && data.date_iso !== cursor) {
        setDateWarning(`Les captures semblent dater du ${fmtDate(data.date_iso)} — tu es sur le ${fmtDate(cursor)}. Vérifie que c'est le bon jour avant de valider.`);
      }
      setExtractedExtra({
        title: data.title || null,
        splits: data.splits || null,
        zones: data.zones || null,
        intervals: data.intervals || null,
        vapPaceSec: data.vap_pace_sec || null,
        elapsedSec: data.elapsed_sec || null,
      });
      setFilledCount(images.length);
    } catch (err) {
      setExtractError("Extraction impossible, remplis les champs manuellement.");
    } finally {
      setExtracting(false);
      e.target.value = "";
    }
  }

  function handleSubmit() {
    const kmNum = parseFloat(String(km).replace(",", "."));
    const durSec = parseDuration(duration);
    if (!kmNum || !durSec) return;
    onSubmit({
      km: kmNum,
      paceSec: Math.round(durSec / kmNum),
      dplus: dplus ? parseInt(dplus, 10) : 0,
      pain, rpe, note,
      title: extractedExtra?.title || null,
      splits: extractedExtra?.splits || null,
      zones: extractedExtra?.zones || null,
      intervals: extractedExtra?.intervals || null,
      vapPaceSec: extractedExtra?.vapPaceSec || null,
      elapsedSec: extractedExtra?.elapsedSec || null,
    });
  }

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: 15 }}>Enregistrer la séance</div>
        <button onClick={onCancel} style={{ background: "none", border: "none", cursor: "pointer", color: "#8A8A92" }}><X size={18} /></button>
      </div>

      <label style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        border: `1.5px dashed ${TEAL}`, borderRadius: 12, padding: "12px 10px", marginBottom: 14,
        color: TEAL, fontSize: 13, fontWeight: 600, cursor: "pointer", background: "#F0F0F1",
      }}>
        <input type="file" accept="image/*" multiple onChange={handleImage} style={{ display: "none" }} disabled={extracting} />
        {extracting ? "Lecture des captures…" : "📷 Ajouter une ou plusieurs captures d'écran (Strava…)"}
      </label>

      <button onClick={handleStravaImport} disabled={stravaLoading} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        border: "1px solid #FC5200", borderRadius: 12, padding: "11px 10px", marginBottom: 14,
        color: "#FC5200", fontSize: 13, fontWeight: 600, cursor: "pointer", background: "white",
      }}>
        {stravaLoading ? "Chargement…" : stravaList ? "Masquer la liste" : "🔗 Importer depuis Strava"}
      </button>
      {stravaError && <div style={{ fontSize: 12, color: CORAL, marginBottom: 10 }}>{stravaError}</div>}
      {stravaList && (
        <div style={{ marginBottom: 14, border: `1px solid ${SILVER}`, borderRadius: 12, overflow: "hidden" }}>
          {stravaList.length === 0 && <div style={{ padding: 12, fontSize: 12.5, color: MUTED }}>Aucune séance récente trouvée.</div>}
          {stravaList.map((a) => (
            <button key={a.id} onClick={() => pickStravaActivity(a)} style={{
              width: "100%", textAlign: "left", background: "white", border: "none",
              borderTop: `1px solid ${SILVER}`, padding: "10px 12px", cursor: "pointer",
            }}>
              <div style={{ fontSize: 12.5, fontWeight: 700 }}>{a.name || "Course"}</div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                {fmtDate((a.start_date_local || "").slice(0, 10))} · {(a.distance / 1000).toFixed(2)} km · {secToDurationStr(a.moving_time)}{a.total_elevation_gain ? ` · D+${Math.round(a.total_elevation_gain)}m` : ""}
              </div>
            </button>
          ))}
        </div>
      )}
      {extractError && <div style={{ fontSize: 12, color: CORAL, marginBottom: 10 }}>{extractError}</div>}
      {dateWarning && <div style={{ fontSize: 12, color: SAND, marginBottom: 10, background: "#EFE7DA", borderRadius: 8, padding: "7px 9px" }}>{dateWarning}</div>}
      {filledCount > 0 && !extractError && (
        <div style={{ fontSize: 11.5, color: MOSS, marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
          <Check size={13} /> Champs pré-remplis depuis {filledCount > 1 ? `${filledCount} captures` : "la capture"} — vérifie avant de valider.
        </div>
      )}

      <Field label="Distance (km)">
        <input value={km} onChange={(e) => setKm(e.target.value)} inputMode="decimal" placeholder="ex : 12.4" style={inputStyle} />
      </Field>
      <Field label="Durée (mm:ss ou h:mm:ss)">
        <input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="ex : 58:30" style={inputStyle} />
      </Field>
      <Field label="Dénivelé positif (m, optionnel)">
        <input value={dplus} onChange={(e) => setDplus(e.target.value)} inputMode="numeric" placeholder="ex : 150" style={inputStyle} />
      </Field>

      <Field label={`Douleur genou / IT band — ${pain}/10`}>
        <input type="range" min="0" max="10" value={pain} onChange={(e) => setPain(parseInt(e.target.value, 10))}
          style={{ width: "100%", accentColor: pain > 0 ? CORAL : MOSS }} />
      </Field>
      <Field label={`Ressenti effort (RPE) — ${rpe}/10`}>
        <input type="range" min="1" max="10" value={rpe} onChange={(e) => setRpe(parseInt(e.target.value, 10))}
          style={{ width: "100%", accentColor: TEAL }} />
      </Field>
      <Field label="Feedback / notes">
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
          placeholder="Sensations, météo, terrain, tout ce qui compte..." style={{ ...inputStyle, resize: "none" }} />
      </Field>

      <button onClick={handleSubmit} style={primaryBtnStyle}>Valider la séance</button>
    </Card>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11.5, color: "#6B6B72", marginBottom: 4, fontWeight: 600 }}>{label}</div>
      {children}
    </div>
  );
}
const inputStyle = {
  width: "100%", border: `1px solid ${MIST}`, borderRadius: 9, padding: "9px 11px",
  fontSize: 14, fontFamily: BODY_FONT, boxSizing: "border-box", background: FOG, color: INK,
};

/* ============================================================
   VUE — JOURNAL
   ============================================================ */
function formatExportText(entries) {
  const list = Object.values(entries).sort((a, b) => a.date.localeCompare(b.date));
  const lines = ["MES SÉANCES — Côte d'Émeraude", ""];
  list.forEach((e) => {
    const plan = PLAN_BY_DATE[e.date];
    lines.push(`${e.date}${plan ? ` (${plan.phase})` : ""} — ${e.title || "Course"}`);
    lines.push(`  ${e.km} km à ${fmtPace(e.paceSec)}/km${e.dplus ? `, D+${e.dplus}m` : ""} · douleur ${e.pain}/10 · RPE ${e.rpe}/10`);
    if (e.vapPaceSec) lines.push(`  VAP moyenne : ${fmtPace(e.vapPaceSec)}/km`);
    if (e.elapsedSec) lines.push(`  Temps écoulé (arrêts compris) : ${secToDurationStr(e.elapsedSec)}`);
    if (e.weather) lines.push(`  Météo : ${weatherLabel(e.weather)}`);
    if (e.note) lines.push(`  Note : ${e.note}`);
    if (e.intervals && e.intervals.length > 0) {
      lines.push(`  Structure : ${e.intervals.map((iv) => `${iv.duration_min}min@${fmtPace(iv.pace_sec)}`).join(" / ")}`);
    }
    if (e.zones && e.zones.length > 0) {
      lines.push(`  Zones : ${e.zones.map((z) => `${z.zone} ${z.percent}%`).join(", ")}`);
    }
    if (e.splits && e.splits.length > 0) {
      lines.push(`  Détail km/km : ${e.splits.map((s) => `km${s.km} ${fmtPace(s.pace_sec)}${s.elevation_m != null ? `(${s.elevation_m > 0 ? "+" : ""}${s.elevation_m}m)` : ""}`).join(", ")}`);
    }
    lines.push("");
  });
  return lines.join("\n");
}

function JournalView({ entries, onImportEntries, stravaConnectError }) {
  const list = Object.values(entries).sort((a, b) => b.date.localeCompare(a.date));
  const [openDate, setOpenDate] = useState(null);
  const [copied, setCopied] = useState(false);
  const [exportText, setExportText] = useState(null);
  const [stravaConnected, setStravaConnected] = useState(() => !!getStravaAuth());
  const [backfillLoading, setBackfillLoading] = useState(false);
  const [backfillMsg, setBackfillMsg] = useState(null);

  async function handleExport() {
    const text = formatExportText(entries);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      setExportText(text);
    }
  }

  function handleStravaClick() {
    if (stravaConnected) {
      clearStravaAuth();
      setStravaConnected(false);
    } else {
      window.location.href = stravaConnectUrl();
    }
  }

  async function handleBackfill() {
    setBackfillLoading(true);
    setBackfillMsg(null);
    try {
      const data = await fetchStravaActivities(60);
      const next = { ...entries };
      let added = 0;
      (Array.isArray(data) ? data : []).forEach((a) => {
        const date = (a.start_date_local || "").slice(0, 10);
        const km = Math.round((a.distance / 1000) * 100) / 100;
        if (!date || !km || next[date]) return; // ne touche jamais une séance déjà loggée
        next[date] = {
          date, km, paceSec: Math.round(a.moving_time / km),
          dplus: Math.round(a.total_elevation_gain || 0),
          pain: 0, rpe: 5,
          note: "Importé depuis Strava — vérifie la douleur et le ressenti.",
          title: a.name || null, elapsedSec: a.elapsed_time || null,
        };
        added++;
      });
      onImportEntries(next);
      setBackfillMsg(added > 0 ? `${added} séance(s) importée(s).` : "Rien de nouveau à importer.");
    } catch (e) {
      setBackfillMsg("Import impossible — vérifie la connexion Strava.");
    } finally {
      setBackfillLoading(false);
    }
  }

  return (
    <div style={{ padding: "18px", paddingLeft: "calc(18px + env(safe-area-inset-left))", paddingRight: "calc(18px + env(safe-area-inset-right))" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 8 }}>
        <div style={{ fontFamily: DISPLAY_FONT, fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em" }}>Journal.</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleStravaClick} style={{
            background: stravaConnected ? "#FC5200" : PAPER, border: `1px solid ${stravaConnected ? "#FC5200" : SILVER}`,
            borderRadius: 10, padding: "7px 12px", fontSize: 11.5, fontWeight: 600,
            color: stravaConnected ? "white" : INK, cursor: "pointer",
          }}>
            {stravaConnected ? "Strava ✓" : "Connecter Strava"}
          </button>
          <button onClick={handleExport} style={{
            background: PAPER, border: `1px solid ${SILVER}`, borderRadius: 10, padding: "7px 12px",
            fontSize: 11.5, fontWeight: 600, color: INK, cursor: "pointer",
          }}>
            {copied ? "Copié ✓" : "Exporter"}
          </button>
        </div>
      </div>

      {stravaConnectError && (
        <div style={{ background: "#F5DAD5", color: CORAL, borderRadius: 10, padding: "9px 12px", fontSize: 12, marginBottom: 14 }}>
          {stravaConnectError}
        </div>
      )}

      {stravaConnected && (
        <div style={{ marginBottom: 14 }}>
          <button onClick={handleBackfill} disabled={backfillLoading} style={{
            width: "100%", background: "white", border: "1px solid #FC5200", borderRadius: 10,
            padding: "9px 0", fontSize: 12.5, fontWeight: 600, color: "#FC5200", cursor: "pointer",
          }}>
            {backfillLoading ? "Import en cours…" : "Importer mon historique Strava"}
          </button>
          {backfillMsg && <div style={{ fontSize: 11.5, color: MUTED, marginTop: 6, textAlign: "center" }}>{backfillMsg}</div>}
        </div>
      )}

      {list.length === 0 && (
        <div style={{ padding: "32px 0", textAlign: "center", color: "#8A8A92", fontSize: 13.5 }}>Aucune séance enregistrée pour l'instant.</div>
      )}

      {exportText && (
        <Card>
          <div style={{ fontSize: 11.5, color: MUTED, marginBottom: 8 }}>
            Copie automatique indisponible — sélectionne tout le texte ci-dessous et copie-le manuellement.
          </div>
          <textarea
            readOnly value={exportText} rows={8}
            onFocus={(e) => e.target.select()}
            style={{ width: "100%", fontSize: 11, fontFamily: MONO_FONT, border: `1px solid ${SILVER}`, borderRadius: 8, padding: 8, boxSizing: "border-box" }}
          />
        </Card>
      )}
      {list.map((e) => {
        const plan = PLAN_BY_DATE[e.date];
        const open = openDate === e.date;
        return (
          <div key={e.date} onClick={() => setOpenDate(open ? null : e.date)} style={{
            background: PAPER, borderRadius: 14, padding: "13px 15px", marginBottom: 9, cursor: "pointer",
            border: `1px solid ${SILVER}`,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 700, textTransform: "capitalize" }}>{fmtDate(e.date)}</div>
                <div style={{ fontSize: 11, color: "#8A8A92" }}>{plan?.phase || "Historique"}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: MONO_FONT, fontSize: 13.5, fontWeight: 700 }}>{e.km} km</div>
                  <div style={{ fontSize: 10.5, color: "#8A8A92" }}>{fmtPace(e.paceSec)}/km</div>
                </div>
                <div style={{
                  width: 9, height: 9, borderRadius: 5, flexShrink: 0,
                  background: e.pain === 0 ? MOSS : e.pain <= 3 ? SAND : CORAL,
                }} title={`Douleur ${e.pain}/10`} />
                <ChevronDown size={15} style={{ color: "#ACACB2", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} />
              </div>
            </div>
            {open && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${SILVER}`, fontSize: 12.5, color: "#3A3A3F" }}>
                {!!e.dplus && <div style={{ marginBottom: 4 }}>D+ : {e.dplus} m</div>}
                <div style={{ marginBottom: 4 }}>Douleur : {e.pain}/10 · RPE : {e.rpe}/10</div>
                {e.note && <div style={{ fontStyle: "italic" }}>« {e.note} »</div>}
                {e.weather && (
                  <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 5, color: MUTED }}>
                    {weatherIcon(e.weather)} {weatherLabel(e.weather)}
                  </div>
                )}
                {e.vapPaceSec && (
                  <div style={{ marginTop: 4 }}>VAP moyenne : {fmtPace(e.vapPaceSec)}/km</div>
                )}
                {e.elapsedSec && Math.abs(e.elapsedSec - Math.round(e.km * e.paceSec)) > 30 && (
                  <div style={{ marginTop: 4 }}>Temps écoulé (arrêts compris) : {secToDurationStr(e.elapsedSec)}</div>
                )}
                {e.intervals && e.intervals.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>Structure de la séance</div>
                    {e.intervals.map((iv, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, padding: "3px 0", borderTop: i > 0 ? `1px solid ${SILVER}` : "none" }}>
                        <span style={{ color: MUTED }}>{iv.duration_min} min</span>
                        <span style={{ fontFamily: MONO_FONT }}>{fmtPace(iv.pace_sec)}/km</span>
                      </div>
                    ))}
                  </div>
                )}
                {e.zones && e.zones.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>Zones d'allure</div>
                    {e.zones.map((z, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, padding: "3px 0", borderTop: i > 0 ? `1px solid ${SILVER}` : "none" }}>
                        <span style={{ color: MUTED }}>{z.zone} ({z.pace_range})</span>
                        <span style={{ fontFamily: MONO_FONT }}>{z.percent}%</span>
                      </div>
                    ))}
                  </div>
                )}
                {e.splits && e.splits.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>Détail km par km</div>
                    {e.splits.map((s, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, padding: "3px 0", borderTop: i > 0 ? `1px solid ${SILVER}` : "none" }}>
                        <span style={{ color: MUTED }}>Km {s.km}</span>
                        <span style={{ fontFamily: MONO_FONT }}>{fmtPace(s.pace_sec)}/km{s.elevation_m != null ? ` · ${s.elevation_m > 0 ? "+" : ""}${s.elevation_m}m` : ""}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   VUE — SUIVI
   ============================================================ */
function SuiviView({ entries }) {
  const SUIVI_START = "2026-06-01";
  const list = Object.values(entries).filter((e) => e.date >= SUIVI_START).sort((a, b) => a.date.localeCompare(b.date));

  const paceData = list.map((e) => ({ date: e.date.slice(5), pace: e.paceSec, label: fmtDate(e.date) }));

  const weekly = useMemo(() => {
    const byWeek = {};
    list.forEach((e) => {
      const wk = isoWeekKey(e.date);
      byWeek[wk] = byWeek[wk] || { actual: 0, planned: 0 };
      byWeek[wk].actual += e.km;
    });
    Object.values(PLAN_BY_DATE).forEach((p) => {
      if (p.km && (p.type === "course" || p.type === "course_renfo" || p.type === "race")) {
        const wk = isoWeekKey(p.date);
        byWeek[wk] = byWeek[wk] || { actual: 0, planned: 0 };
        byWeek[wk].planned += p.km;
      }
    });
    return Object.entries(byWeek).sort((a, b) => a[0].localeCompare(b[0])).map(([wk, v]) => ({
      week: new Date(wk + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
      actual: Math.round(v.actual * 10) / 10,
      planned: Math.round(v.planned * 10) / 10,
    }));
  }, [list]);

  const painRecent = list.slice(-14);
  const anyPain = list.some((e) => e.pain > 0);

  return (
    <div style={{ padding: "18px", paddingLeft: "calc(18px + env(safe-area-inset-left))", paddingRight: "calc(18px + env(safe-area-inset-right))" }}>
      <div style={{ fontFamily: DISPLAY_FONT, fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 14 }}>Suivi.</div>

      <Card>
        <SectionTitle>Allure au fil des sorties</SectionTitle>
        <div style={{ height: 170 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={paceData} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="paceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={INK} stopOpacity="0.16" />
                  <stop offset="100%" stopColor={INK} stopOpacity="0" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={SILVER} strokeDasharray="3 4" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 9.5, fill: MUTED }} axisLine={{ stroke: SILVER }} tickLine={false} />
              <YAxis reversed tickFormatter={fmtPace} tick={{ fontSize: 9.5, fill: MUTED }} domain={["dataMin - 15", "dataMax + 15"]} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [fmtPace(v) + "/km", "Allure"]} labelFormatter={(l, p) => p?.[0]?.payload?.label || l}
                contentStyle={{ fontSize: 12, borderRadius: 10, border: `1px solid ${SILVER}`, boxShadow: "0 4px 14px rgba(21,21,23,0.1)" }} />
              <ReferenceLine y={330} stroke={SAND} strokeDasharray="3 3" label={{ value: "easy ~5:30", fontSize: 9, fill: SAND, position: "insideTopRight" }} />
              <Area type="monotone" dataKey="pace" stroke="none" fill="url(#paceFill)" />
              <Line type="monotone" dataKey="pace" stroke={INK} strokeWidth={2.2} dot={{ r: 3, fill: INK, strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <SectionTitle>Volume hebdomadaire — réalisé vs prévu</SectionTitle>
        <div style={{ height: 170 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekly} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GRAPHITE} />
                  <stop offset="100%" stopColor={INK} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={SILVER} strokeDasharray="3 4" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 9.5, fill: MUTED }} axisLine={{ stroke: SILVER }} tickLine={false} />
              <YAxis tick={{ fontSize: 9.5, fill: MUTED }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v, name) => [v + " km", name === "actual" ? "Réalisé" : "Prévu"]} contentStyle={{ fontSize: 12, borderRadius: 10, border: `1px solid ${SILVER}`, boxShadow: "0 4px 14px rgba(21,21,23,0.1)" }} />
              <Bar dataKey="actual" fill="url(#barFill)" radius={[5, 5, 0, 0]} maxBarSize={20} />
              <Bar dataKey="planned" fill={SILVER} radius={[5, 5, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 10.5, color: MUTED }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: INK, display: "inline-block" }} /> Réalisé</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: SILVER, display: "inline-block", border: `1px solid ${MUTED}` }} /> Prévu</span>
        </div>
      </Card>

      <Card>
        <SectionTitle>Suivi douleur genou / IT band</SectionTitle>
        {!anyPain && (
          <div style={{ fontSize: 12.5, color: MOSS, display: "flex", alignItems: "center", gap: 6 }}>
            <Check size={15} /> Aucune douleur enregistrée récemment.
          </div>
        )}
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 8 }}>
          {painRecent.map((e) => (
            <div key={e.date} title={`${fmtDate(e.date)} — douleur ${e.pain}/10`} style={{
              width: 20, height: 20, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
              background: e.pain === 0 ? "#EAEAEC" : e.pain <= 3 ? "#EFE7DA" : "#EFDEDC",
              color: e.pain === 0 ? MOSS : e.pain <= 3 ? SAND : CORAL, fontSize: 9.5, fontFamily: MONO_FONT, fontWeight: 700,
            }}>
              {e.pain}
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11.5, color: MUTED, marginTop: 10 }}>
          Le 28 juin reste la seule alerte à ce jour. Si un score ≥ 4 réapparaît, c'est le signal pour lever le pied sur le dénivelé et reconsidérer un passage chez le kiné.
        </p>
      </Card>
    </div>
  );
}
function SectionTitle({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 10 }}>{children}</div>;
}
