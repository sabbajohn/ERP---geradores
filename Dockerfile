# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

# Production stage
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist /usr/share/nginx/html

# Mantém padrão do nginx, mas você pode mudar se quiser
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
