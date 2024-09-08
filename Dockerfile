FROM node:18-alpine as build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
FROM node:18-alpine AS runner
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --only=production --legacy-peer-deps
COPY --from=build /app/dist ./dist
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/main"]