FROM nginx:alpine

ARG API_HOST=192.168.122.12

COPY produtos.html /usr/share/nginx/html/index.template.html
RUN sed "s|{{ api_host }}|${API_HOST}|g" \
      /usr/share/nginx/html/index.template.html \
      > /usr/share/nginx/html/index.html \
    && rm /usr/share/nginx/html/index.template.html

EXPOSE 80