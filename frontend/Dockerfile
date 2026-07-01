FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Setting VITE_API_URL here is tricky because it's baked at build time.
# For Docker Compose, we can pass it as a build arg if needed, 
# or just rely on a relative path if served from the same domain (e.g. reverse proxy).
# For simplicity, we assume the backend is available at the default or provided ENV.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Create an Nginx template to automatically use the $PORT environment variable (defaulting to 80)
# Nginx's alpine image automatically runs envsubst on files in /etc/nginx/templates/
RUN mkdir -p /etc/nginx/templates && echo 'server { \
    listen ${PORT}; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/templates/default.conf.template

ENV PORT=80
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
