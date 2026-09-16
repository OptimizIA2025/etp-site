# etp-site

[![CI](https://github.com/OptimizIA2025/etp-site/actions/workflows/ci.yml/badge.svg)](https://github.com/OptimizIA2025/etp-site/actions/workflows/ci.yml)
[![CodeQL](https://github.com/OptimizIA2025/etp-site/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/OptimizIA2025/etp-site/actions/workflows/github-code-scanning/codeql)
[![Site](https://img.shields.io/badge/site-ExoTradingPlus-2ea44f)](https://exotradingplus.com/)

Canal de livraison du site **ExoTradingPlus!** (`exotradingplus.com`).

Ce dépôt ne contient pas le projet : il contient ce qui part en production.
Le site se développe dans le vault Obsidian, sous
`OptimizIA.xyz/05 Projets/ExoTradingPlus!/03 Publie & Live/`, et la publication
passe par `(C) publier.ps1` du même dossier.

## Contenu

| Chemin | Rôle |
| --- | --- |
| `site/` | Le site servi : `03 Publie & Live/` moins les exclusions de la notice de déploiement. |
| `nginx.conf` | Config minimale : gzip, 404. Pas de CSP ni HSTS pour l'instant. |
| `Dockerfile` | Image nginx + le site, pour un futur hébergement Coolify. |

## État du canal

Le domaine pointe encore sur LWS (`91.216.107.46`, Apache) : un push ici ne met
**pas** en ligne. Deux canaux coexistent jusqu'à la bascule DNS vers le VPS
Coolify :

1. `(C) publier.ps1` pousse ici **et** régénère `Deploiement/` pour le WinSCP de RGI.
2. Après bascule DNS + application Coolify branchée sur ce dépôt, le push suffira.

## Limite à connaître

`site/assets/Presentation_CompleteRemy_ETP.mp4` pèse **90 Mo**. La limite dure
de GitHub est 100 Mo par fichier : toute version plus lourde de cette vidéo
doit passer par Git LFS ou être hébergée hors dépôt.

## Automatisation

- **CI** (`.github/workflows/ci.yml`) : à chaque push sur `main` et à chaque pull request, l'image est construite, `nginx -t` est exécuté, puis un conteneur est lancé et vérifié par `scripts/verifier-image.sh` (pages en 200, redirections, en-têtes de sécurité, compression). Le résultat est dans le résumé du job. Un second job vérifie les documents Markdown (markdownlint, lychee).
- **Dependabot** : montées de version de l'image nginx et des GitHub Actions, chaque semaine. Les mises à jour patch et mineures sont fusionnées automatiquement une fois la CI passée, ce qui déploie l'image mise à jour ; les majeures attendent une relecture.
- **Ruleset sur `main`** : pas de suppression ni de force push, pull request et vérifications requises pour tout le monde sauf les administrateurs, qui gardent le push direct (le mode de publication normal du site).
- **CodeQL**, **dependency review**, secret scanning avec protection au push. Voir [SECURITY.md](SECURITY.md) et [CONTRIBUTING.md](CONTRIBUTING.md).
