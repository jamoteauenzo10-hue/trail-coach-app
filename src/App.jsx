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
  { offset: 1, type: "course", title: "Footing très facile", km: 6, pace: "5:30-5:50", details: "Ajout à la demande — vraiment easy, ça s'ajoute à la récup de Quiberon, ça ne la remplace pas. Aucune ambition sur cette séance." },
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
  { name: "Pompes (standard / genoux / surélevées)", sets: "3-4 × 8-15 reps" },
  { name: "Pompes piquées (épaules)", sets: "3 × 8-12 reps" },
  { name: "Dips sur chaise", sets: "3 × 10-15 reps" },
  { name: "Rowing élastique (ou sac à dos lesté)", sets: "3 × 12 reps" },
  { name: "Gainage planche + variantes latérales", sets: "3 × 30-45 sec / côté" },
  { name: "Superman (dos)", sets: "3 × 12 reps" },
];
const SEANCE_B = [
  { name: "Hip thrust unilatéral (pied surélevé)", sets: "3 × 10-12 reps / jambe" },
  { name: "Pont fessier", sets: "3 × 15 reps" },
  { name: "Step-ups (marche / chaise)", sets: "3 × 10-12 reps / jambe" },
  { name: "Squats bulgares (pied arrière surélevé)", sets: "3 × 8-10 reps / jambe" },
  { name: "Clamshells avec élastique", sets: "3 × 15-20 reps / côté" },
  { name: "Abduction de hanche allongé", sets: "3 × 15 reps / côté" },
  { name: "Fentes marchées", sets: "2 × 10 reps / jambe" },
  { name: "Mollets sur marche", sets: "3 × 15-20 reps" },
];
const SEANCE_A_LIGHT = [
  { name: "Pompes", sets: "2 × 10 reps" },
  { name: "Gainage planche", sets: "2 × 30 sec" },
  { name: "Mobilité épaules / thoracique", sets: "5 min" },
];
const SEANCE_B_LIGHT = [
  { name: "Clamshells avec élastique", sets: "2 × 15 reps / côté" },
  { name: "Pont fessier", sets: "2 × 15 reps" },
  { name: "Abduction de hanche allongé", sets: "2 × 12 reps / côté" },
];
const ACTIVATION = [
  { name: "Clamshells avec élastique", sets: "2 × 15 reps / côté" },
  { name: "Marche latérale élastique (monster walk)", sets: "2 × 15 pas / côté" },
  { name: "Pont fessier", sets: "2 × 10 reps" },
];
const RENFO_SETS = { A: SEANCE_A, B: SEANCE_B, A_LIGHT: SEANCE_A_LIGHT, B_LIGHT: SEANCE_B_LIGHT, ACTIVATION };
const RENFO_LABEL = {
  A: "Séance A — Haut du corps", B: "Séance B — Jambes / hanches",
  A_LIGHT: "Séance A — allégée", B_LIGHT: "Séance B — allégée",
  ACTIVATION: "Activation hanches (optionnel, sans fatigue)",
};

const construction = (start, label, tueKm, thuDetail, thuKm, satKm, satD, sunKm, sunD, sunNote) => phaseWeek({
  start, label, color: P.sand,
  days: [
    { type: "repos", title: "Repos complet" },
    { type: "course_renfo", title: "Course facile", km: tueKm, pace: "5:20-5:35", details: "Course d'abord, renfo le soir.", renfoKey: "A" },
    { type: "renfo", title: "Renfo B — Jambes / hanches", details: "Dédié, pas de course ce jour. Focus moyen fessier / TFL.", renfoKey: "B" },
    { type: "course", title: "Course qualité", km: thuKm, pace: "soutenu", details: thuDetail },
    { type: "repos", title: "Repos", details: "En option, sans fatigue :", renfoKey: "ACTIVATION" },
    { type: "course", title: "Course vallonnée", km: satKm, dplus: satD, pace: "conversationnelle", details: "Terrain spécifique, dénivelé progressif." },
    { type: "course", title: "Sortie longue", km: sunKm, dplus: sunD, pace: "5:20-5:40", details: sunNote || "Petits pas en descente, cadence rapide." },
  ],
});

const PLAN = [
  ...construction("2026-07-13", "S1 — Construction", 8, "15 min échauffement + 12-15 min allure soutenue + retour au calme.", 8, 8, 150, 16, 120),
  ...construction("2026-07-20", "S2 — Construction", 9, "15 min échauffement + 8 répétitions de 30-40 sec en côte courte ou escalier (effort quasi maximal), retour en trottinant entre chaque + 10 min retour au calme.", 8, 9, 175, 19, 150, "Premier test ravito léger si la sortie dépasse 1h15."),
  ...construction("2026-07-27", "S3 — Construction", 10, "15 min échauffement + 20-25 min à allure seuil (proche allure semi-marathon) + retour au calme.", 8, 10, 200, 22, 220, "Début officiel du protocole nutrition course : ~60 g glucides/heure dès la 2ᵉ heure."),
  ...construction("2026-08-03", "S4 — Spécifique 1", 10, "15 min échauffement + 10 répétitions de 30-45 sec en côte ou escalier, retour en trottinant + retour au calme.", 9, 12, 250, 25, 320, "Nutrition à nouveau testée, ajuster selon le ressenti précédent."),
  ...phaseWeek({
    start: "2026-08-10", label: "S5 — Spécifique 2", color: P.navy,
    days: [
      { type: "repos", title: "Repos complet" },
      { type: "course_renfo", title: "Course facile", km: 9, pace: "5:20-5:35", details: "Raccourcir le renfo à 20 min si les jambes sont lourdes.", renfoKey: "A" },
      { type: "renfo", title: "Renfo B — Jambes / hanches", details: "Dédié.", renfoKey: "B" },
      { type: "course", title: "Course qualité", km: 8, pace: "soutenu", details: "15 min échauffement + 8-10 répétitions de 45 sec en côte ou escalier, focus fréquence de foulée + retour au calme." },
      { type: "repos", title: "Repos", details: "En option, sans fatigue :", renfoKey: "ACTIVATION" },
      { type: "course", title: "Bloc fatigue — jour 1", km: 18, dplus: 350, pace: "spécifique", details: "Premier jour du week-end enchaîné." },
      { type: "course", title: "Bloc fatigue — jour 2", km: 27, dplus: 380, pace: "spécifique", details: "Sur jambes fatiguées de la veille. Observer la réaction du genou en descente en fin de bloc." },
    ],
  }),
  ...phaseWeek({
    start: "2026-08-17", label: "S6 — Spécifique 3 (pic)", color: P.navy,
    days: [
      { type: "repos", title: "Repos complet" },
      { type: "course_renfo", title: "Course facile", km: 9, pace: "5:20-5:35", details: "Course d'abord, renfo le soir.", renfoKey: "A" },
      { type: "renfo", title: "Renfo B — Jambes / hanches", details: "Dédié.", renfoKey: "B" },
      { type: "course", title: "Course qualité modérée", km: 9, pace: "modéré", details: "15 min échauffement + 4-5 accélérations progressives de 20 sec + retour au calme. Garder de la fraîcheur pour le week-end." },
      { type: "repos", title: "Repos", details: "En option, sans fatigue :", renfoKey: "ACTIVATION" },
      { type: "course", title: "Vallonné très léger", km: 8, dplus: 100, pace: "easy", details: "Jambes actives sans les fatiguer avant la sortie reine du lendemain." },
      { type: "course", title: "Sortie longue de référence — 40 km", km: 40, dplus: 750, pace: "allure course", details: "La grosse sortie de la préparation, 3 semaines avant la course pile. Ravitaillement réel (60 g glucides/h), gestion des transitions course/marche sur terrain technique. Si possible, termine sur du sable pour retrouver la sensation des 10 derniers km du parcours." },
    ],
  }),
  ...construction("2026-08-24", "S7 — Décharge", 8, "15 min échauffement + 4-5 lignes droites de 20 sec + retour au calme. Intensité minimale, semaine de décharge.", 7, 8, 150, 20, 180, "Pas de recherche de performance, volume tranquille."),
  ...phaseWeek({
    start: "2026-08-31", label: "S8 — Affûtage", color: P.mist,
    days: [
      { type: "repos", title: "Repos complet" },
      { type: "course_renfo", title: "Footing", km: 6, pace: "easy", details: "Renfo allégée le soir, sans charge.", renfoKey: "A_LIGHT" },
      { type: "renfo", title: "Renfo B allégée", details: "Activation seulement, pas de charge.", renfoKey: "B_LIGHT" },
      { type: "course", title: "Footing + lignes droites", km: 5, pace: "easy", details: "3-4 accélérations courtes pour garder du tonus." },
      { type: "repos", title: "Repos", details: "Vérifier le matériel : chaussures trail, ravitos, montre chargée." },
      { type: "repos", title: "Repos ou marche" },
      { type: "course", title: "Footing facile", km: 8, pace: "easy", details: "Dernière sortie avant la semaine de course." },
    ],
  }),
  ...phaseWeek({
    start: "2026-09-07", label: "S9 — Semaine de course", color: P.coral,
    days: [
      { type: "course", title: "Footing très court", km: 3, pace: "easy", details: "20 min, easy." },
      { type: "repos", title: "Repos ou marche" },
      { type: "course", title: "Footing + accélérations", km: 4, pace: "easy", details: "20-25 min avec 2-3 accélérations courtes (10-15s)." },
      { type: "repos", title: "Repos complet" },
      { type: "repos", title: "Repos complet", details: "Préparation sac / ravitos, coucher tôt." },
      { type: "race", title: "COURSE — Trail Côte d'Émeraude", km: 54, dplus: 1200, pace: "6h00-6h30", details: "Départ prudent. Gestion des descentes en 2ᵉ moitié. Nutrition 60 g glucides/h dès H2." },
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
  try {
    let url;
    if (dateIso < today) {
      url = `https://archive-api.open-meteo.com/v1/archive?latitude=${coords.lat}&longitude=${coords.lon}&start_date=${dateIso}&end_date=${dateIso}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=Europe%2FParis`;
    } else if (daysAhead <= 15) {
      url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&start_date=${dateIso}&end_date=${dateIso}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=Europe%2FParis`;
    } else {
      return null;
    }
    const res = await fetch(url);
    const data = await res.json();
    if (!data.daily || !data.daily.time || data.daily.time.length === 0) return null;
    return {
      tempMax: Math.round(data.daily.temperature_2m_max[0]),
      tempMin: Math.round(data.daily.temperature_2m_min[0]),
      precip: data.daily.precipitation_sum[0],
      windMax: Math.round(data.daily.wind_speed_10m_max[0]),
    };
  } catch (e) {
    return null;
  }
}

function weatherIcon(weather, size = 14) {
  if (!weather) return null;
  const props = { size, strokeWidth: 2 };
  if (weather.precip >= 1) return <CloudRain {...props} />;
  if (weather.windMax >= 30) return <Wind {...props} />;
  return <Sun {...props} />;
}

function weatherLabel(weather) {
  if (!weather) return "";
  const parts = [`${weather.tempMax}°`];
  if (weather.tempMin != null) parts[0] += `/${weather.tempMin}°`;
  parts.push(`vent ${weather.windMax} km/h`);
  if (weather.precip >= 1) parts.push(`${weather.precip} mm pluie`);
  return parts.join(" · ");
}

async function extractRunFromImage(base64, mediaType) {
  const text = await callClaudeAPI({
    system: "Tu extrais des données de course à pied depuis une capture d'écran d'application de running (Strava ou similaire). Réponds UNIQUEMENT avec un objet JSON, sans texte autour, sans balises markdown. Format exact : {\"distance_km\": number|null, \"duration_sec\": number|null, \"dplus_m\": number|null, \"date_iso\": string|null}. Le temps doit être converti en secondes au total. La date doit être déduite du texte visible et convertie au format YYYY-MM-DD ; si absente ou illisible, mets null plutôt que d'inventer.",
    messages: [{
      role: "user",
      content: [
        { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
        { type: "text", text: "Extrait les données de cette capture d'écran." },
      ],
    }],
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
    ? `${weather.tempMax}°C (min ${weather.tempMin}°C), vent ${weather.windMax} km/h${weather.precip >= 1 ? `, ${weather.precip}mm de pluie` : ""}`
    : "non disponible";
  const text = await callClaudeAPI({
    system: "Tu es un coach de trail expérimenté, chaleureux mais direct. Tu réponds en 2 à 4 phrases maximum, en français, sans emoji, sans markdown, sans poser de question. Tu commentes la séance à la lumière du plan prévu, de l'historique récent et de la météo du jour (une allure plus lente par forte chaleur ou grand vent n'est pas un signal d'alarme), en gardant en tête un antécédent de syndrome de l'essuie-glace (IT band) survenu le 28 juin après une descente en fatigue.",
    messages: [{
      role: "user",
      content: `Séance prévue : ${plan?.title || "non planifiée"}${plan?.km ? ` (${plan.km} km, ${plan.pace || ""})` : ""}.
Séance réalisée : ${payload.km} km à ${fmtPace(payload.paceSec)}/km${payload.dplus ? `, D+${payload.dplus}m` : ""}, douleur genou ${payload.pain}/10, RPE ${payload.rpe}/10.
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
      if (w.tempMax >= 24) {
        msgs.push({ tone: "good", text: `Il faisait chaud ce jour-là (${w.tempMax}°C) — une allure un peu plus lente que prévu s'explique très bien par la météo, pas d'inquiétude à avoir.` });
      } else if (w.windMax >= 30) {
        msgs.push({ tone: "good", text: `Vent soutenu ce jour-là (${w.windMax} km/h) — ça pèse sur l'allure et le ressenti, à prendre en compte avant de comparer avec d'autres séances.` });
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
        />
      )}
      {tab === "journal" && <JournalView entries={entries} />}
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
function TodayView({ cursor, goDay, plan, logged, formOpen, setFormOpen, submitLog, feedback, isToday, coachComment, coachLoading, weather, weatherLoading }) {
  const runnable = plan && (plan.type === "course" || plan.type === "course_renfo" || plan.type === "race");
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

          {plan.details && <p style={{ fontSize: 13, lineHeight: 1.5, color: "#3A3A3F", marginTop: 8 }}>{plan.details}</p>}
          {plan.renfoKey && <RenfoDetail renfoKey={plan.renfoKey} />}

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
        <LogForm plan={plan} cursor={cursor} onCancel={() => setFormOpen(false)} onSubmit={submitLog} />
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
  const list = RENFO_SETS[renfoKey];
  if (!list) return null;
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
      {open && list.map((ex, i) => (
        <div key={i} style={{
          display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12.5, padding: "8px 0",
          borderTop: `1px solid ${SILVER}`,
        }}>
          <span style={{ color: BODY_TEXT }}>{ex.name}</span>
          <span style={{ fontFamily: MONO_FONT, color: MUTED, flexShrink: 0, whiteSpace: "nowrap" }}>{ex.sets}</span>
        </div>
      ))}
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
function LogForm({ plan, cursor, onCancel, onSubmit }) {
  const [km, setKm] = useState(plan.km || "");
  const [duration, setDuration] = useState("");
  const [dplus, setDplus] = useState(plan.dplus || "");
  const [pain, setPain] = useState(0);
  const [rpe, setRpe] = useState(5);
  const [note, setNote] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState(null);
  const [dateWarning, setDateWarning] = useState(null);
  const [filled, setFilled] = useState(false);

  function parseDuration(str) {
    const parts = str.split(":").map((p) => parseInt(p, 10));
    if (parts.some(isNaN)) return null;
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return null;
  }

  async function handleImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setExtracting(true);
    setExtractError(null);
    setDateWarning(null);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result.split(",")[1]);
        r.onerror = () => reject(new Error("Lecture impossible"));
        r.readAsDataURL(file);
      });
      const data = await extractRunFromImage(base64, file.type || "image/jpeg");
      if (data.distance_km) setKm(String(data.distance_km));
      if (data.duration_sec) setDuration(secToDurationStr(data.duration_sec));
      if (data.dplus_m != null) setDplus(String(data.dplus_m));
      if (data.date_iso && data.date_iso !== cursor) {
        setDateWarning(`La capture semble dater du ${fmtDate(data.date_iso)} — tu es sur le ${fmtDate(cursor)}. Vérifie que c'est le bon jour avant de valider.`);
      }
      setFilled(true);
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
        <input type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} disabled={extracting} />
        {extracting ? "Lecture de la capture…" : "📷 Ajouter une capture d'écran (Strava…)"}
      </label>
      {extractError && <div style={{ fontSize: 12, color: CORAL, marginBottom: 10 }}>{extractError}</div>}
      {dateWarning && <div style={{ fontSize: 12, color: SAND, marginBottom: 10, background: "#EFE7DA", borderRadius: 8, padding: "7px 9px" }}>{dateWarning}</div>}
      {filled && !extractError && (
        <div style={{ fontSize: 11.5, color: MOSS, marginBottom: 10, display: "flex", alignItems: "center", gap: 5 }}>
          <Check size={13} /> Champs pré-remplis depuis la capture — vérifie avant de valider.
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
function JournalView({ entries }) {
  const list = Object.values(entries).sort((a, b) => b.date.localeCompare(a.date));
  const [openDate, setOpenDate] = useState(null);
  if (list.length === 0) {
    return <div style={{ padding: 32, textAlign: "center", color: "#8A8A92", fontSize: 13.5 }}>Aucune séance enregistrée pour l'instant.</div>;
  }
  return (
    <div style={{ padding: "18px", paddingLeft: "calc(18px + env(safe-area-inset-left))", paddingRight: "calc(18px + env(safe-area-inset-right))" }}>
      <div style={{ fontFamily: DISPLAY_FONT, fontSize: 26, fontWeight: 900, letterSpacing: "-0.02em", marginBottom: 14 }}>Journal.</div>
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
  const list = Object.values(entries).sort((a, b) => a.date.localeCompare(b.date));

  const paceData = list.map((e) => ({ date: e.date.slice(5), pace: e.paceSec, label: fmtDate(e.date) }));

  const weekly = useMemo(() => {
    const byWeek = {};
    list.forEach((e) => {
      const wk = isoWeekKey(e.date);
      byWeek[wk] = (byWeek[wk] || 0) + e.km;
    });
    return Object.entries(byWeek).sort((a, b) => a[0].localeCompare(b[0])).map(([wk, km]) => ({
      week: new Date(wk + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
      km: Math.round(km * 10) / 10,
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
        <SectionTitle>Volume hebdomadaire</SectionTitle>
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
              <Tooltip formatter={(v) => [v + " km", "Volume"]} contentStyle={{ fontSize: 12, borderRadius: 10, border: `1px solid ${SILVER}`, boxShadow: "0 4px 14px rgba(21,21,23,0.1)" }} />
              <Bar dataKey="km" fill="url(#barFill)" radius={[5, 5, 0, 0]} maxBarSize={26} />
            </BarChart>
          </ResponsiveContainer>
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
