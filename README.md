# La Penderie de Fériel

Styliste personnel IA mobile-first, propulsé par Gemini. Garde-robe digitale, suggestions de tenues et essayage virtuel.

## Fonctionnalités

- **Chat IA** — Conversation naturelle avec un styliste personnel (Gemini) qui connaît ta garde-robe
- **Garde-robe digitale** — Photographie tes vêtements, l'IA les analyse et les classe automatiquement
- **Suggestions de tenues** — Tenues adaptées à l'occasion, la météo et tes préférences
- **Essayage virtuel** — Génération d'images pour visualiser les tenues sur toi
- **Valise intelligente** — Optimisation de valise pour les voyages (minimum de pièces, maximum de combinaisons)

## Stack technique

- React 19 + TypeScript
- Vite + Tailwind CSS v4
- Google Gemini API (chat + génération d'images)
- IndexedDB (stockage local via idb-keyval)

## Lancer en local

```bash
npm install
cp .env.example .env.local
# Renseigner GEMINI_API_KEY dans .env.local
npm run dev
```

## Déploiement

Hébergé sur Vercel. Le build est un simple `vite build` qui produit un site statique dans `dist/`.

La variable d'environnement `GEMINI_API_KEY` doit être configurée dans les settings Vercel.
