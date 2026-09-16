# ExoTradingPlus! - image de service statique.
#
# Prete pour un hebergement Coolify (VPS 72.62.22.42), meme modele que
# optimizia-site et seoplus-site. Tant que exotradingplus.com pointe sur
# LWS (91.216.107.46), cette image ne sert pas la production : la mise en
# ligne reste le WinSCP de RGI depuis Deploiement/.

FROM nginx:1.31-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY site/ /usr/share/nginx/html/

EXPOSE 80
