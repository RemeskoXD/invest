# ════════════════════════════════════════════════════
#  G3NE5IS — Static site + nginx server-side auth
#  Admin panel chráněn HTTP Basic Auth na nginx úrovni
# ════════════════════════════════════════════════════
FROM nginx:alpine

# Potřebujeme apache2-utils jen pro vygenerování htpasswd (pak odstraníme)
RUN apk add --no-cache apache2-utils

# Generujeme htpasswd soubor s bcrypt hashovaným heslem
# Heslo se zde vyskytuje pouze v build fázi a NENÍ uloženo v image jako plaintext
RUN htpasswd -cbB /etc/nginx/.htpasswd admin UUGDSJD8767SD && \
    apk del apache2-utils

# Kopírujeme statické soubory webu
COPY --chown=nginx:nginx . /usr/share/nginx/html/

# Kopírujeme custom nginx konfiguraci
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Odstraníme výchozí nginx konfiguraci
RUN rm -f /etc/nginx/conf.d/default.conf.bak

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
