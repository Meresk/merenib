# Этап запуска
FROM nginx:stable-alpine

# Удаляем конфиг по умолчанию
RUN rm -rf /etc/nginx/conf.d/default.conf

# Копируем скомпилированные файлы фронтенда
COPY dist /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Устанавливаем права
RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 3000
CMD [ "nginx", "-g", "daemon off;" ]
