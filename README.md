# Côte d'Émeraude — Trail Prep

Ton appli de suivi de préparation, en site autonome (plus de lien claude.ai).

## Ce dont tu as besoin

- Un compte GitHub (gratuit) — sert juste à héberger le code pour Vercel
- Un compte Vercel (gratuit) — héberge le site
- Un compte API Anthropic (console.anthropic.com ou platform.claude.com, même chose) — fait tourner l'extraction de capture + le commentaire de coach

Coût réel attendu : quasi nul (voir section "Combien ça coûte" en bas).

---

## Étape 1 — Créer ta clé API Anthropic

1. Va sur **console.anthropic.com** (ou platform.claude.com) et crée un compte (différent de ton compte claude.ai classique).
2. Vérifie ton email / téléphone si demandé.
3. Va dans **Settings → Billing**, ajoute une carte bancaire (nécessaire même pour utiliser les crédits gratuits offerts à l'inscription — pas de prélèvement tant que les crédits ne sont pas épuisés).
4. Va dans **Settings → API Keys → Create Key**. Donne-lui un nom (ex : `trail-app`).
5. **Copie la clé immédiatement** (elle commence par `sk-ant-`) — elle ne sera plus jamais réaffichée. Colle-la dans un endroit sûr en attendant l'étape 4.

Optionnel mais recommandé : dans la même page, tu peux fixer une **limite de dépense mensuelle** (ex : 5 $) pour être tranquille.

---

## Étape 2 — Mettre le code sur GitHub

1. Crée un compte sur **github.com** si tu n'en as pas.
2. Crée un nouveau dépôt (bouton vert "New").
3. Le plus simple : utilise **github.com/new** puis "uploader des fichiers" et glisse-dépose tout le contenu de ce dossier (`trail-coach-app`) — sauf le fichier `.env` si tu en crées un en local, il ne doit jamais être mis en ligne.

*(Si tu es à l'aise avec le terminal : `git init`, `git add .`, `git commit -m "init"`, puis suis les instructions GitHub pour pousser le dépôt.)*

---

## Étape 3 — Déployer (Vercel OU Netlify, au choix)

Le projet contient les fichiers nécessaires pour les deux. Choisis-en un seul.

### Option A — Vercel

1. Va sur **vercel.com**, crée un compte (connexion directe possible avec GitHub).
2. Clique **Add New → Project**, choisis ton dépôt GitHub.
3. Vercel détecte automatiquement Vite — laisse les réglages par défaut.
4. **Avant de cliquer Deploy**, dépli **Environment Variables** et ajoute :
   - Name : `ANTHROPIC_API_KEY`
   - Value : ta clé `sk-ant-...`
5. Clique **Deploy**. URL obtenue : `ton-projet.vercel.app`.

### Option B — Netlify

1. Va sur **netlify.com**, crée un compte (connexion directe possible avec GitHub).
2. Clique **Add new site → Import an existing project**, choisis ton dépôt GitHub.
3. Netlify lit automatiquement le fichier `netlify.toml` du projet (build, dossier de fonctions, redirections) — laisse les réglages par défaut.
4. **Avant de déployer**, va dans **Site settings → Environment variables → Add a variable** :
   - Key : `ANTHROPIC_API_KEY`
   - Value : ta clé `sk-ant-...`
5. Clique **Deploy site**. URL obtenue : `ton-projet.netlify.app`.

Note technique si jamais la fonction Netlify renvoie une erreur au premier essai : renomme `netlify/functions/claude.js` en `claude.mjs` — certains environnements Netlify sont plus stricts sur la détection du format de module. Le reste du projet ne change pas.

---

## Étape 4 — L'installer sur ton iPhone

1. Ouvre l'URL Vercel dans **Safari**.
2. Icône de partage → **"Sur l'écran d'accueil"**.
3. L'icône ouvre maintenant le site en plein écran, sans barre d'adresse — comme une vraie appli.

---

## Comment ça reste connecté à Claude pour tes feedbacks

Le site que tu as déployé contient une petite fonction serveur (`api/claude.js` pour Vercel, `netlify/functions/claude.js` pour Netlify — une seule des deux est réellement utilisée selon ta plateforme) qui :
- reçoit tes captures d'écran et tes demandes de commentaire coach depuis l'appli,
- les transmet à l'API Claude en utilisant ta clé (`ANTHROPIC_API_KEY`), gardée uniquement côté serveur — jamais visible dans le navigateur ni dans le code que tu partages,
- te renvoie l'extraction des données et le commentaire.

Tu n'as besoin d'être connecté à rien de particulier pour que ça marche : c'est ta clé API à toi (liée à ton compte Anthropic Console) qui fait tourner l'analyse, pas ton compte claude.ai.

---

## Combien ça coûte

- **Hébergement Vercel** : 0 € (plan gratuit largement suffisant pour un usage perso).
- **API Claude** : environ 1 à 2 centimes par séance loggée (extraction de capture + commentaire coach). Sur les ~9 semaines restantes avant la course, ça représente 1 à 3 € au total.
- **Crédit offert à la création du compte API** (souvent 5 $) couvre très probablement l'intégralité de cet usage.

---

## Mettre à jour l'appli plus tard

Si tu veux modifier le plan ou ajouter une fonctionnalité : remplace le fichier `src/App.jsx` par la nouvelle version, remets-le sur GitHub (ou re-upload), Vercel redéploie automatiquement en 1-2 minutes.

## Tes données

Elles sont stockées dans le navigateur de ton iPhone (localStorage), liées à ce site précis. Si tu changes de téléphone ou effaces les données Safari, elles seront perdues — pense à faire un export manuel de temps en temps si tu veux les garder (copier le contenu du Journal, par exemple).
