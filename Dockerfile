FROM node:22-alpine AS build
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY frontend ./frontend
RUN npm run build
FROM node:22-alpine
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --no-audit --no-fund && npm cache clean --force
COPY --from=build /app/frontend/dist ./frontend/dist
COPY backend ./backend
COPY openapi.json ./openapi.json
RUN mkdir -p /app/node_modules/.prisma && chown -R node:node /app
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["sh","-c","node backend/src/bootstrap.js && node backend/src/server.js"]
