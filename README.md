# etp-site

Canal de livraison du site **ExoTradingPlus!** (`exotradingplus.com`).

Ce dépôt ne contient pas le projet : il contient ce qui part en production.
Le site se développe dans le vault Obsidian, sous
`OptimizIA.xyz/05 Projets/ExoTradingPlus!/03 Publie & Live/`, et la publication
passe par `(C) publier.ps1` du même dossier.

## Contenu

| Chemin | Rôle |
|---|---|
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
