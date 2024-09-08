FROM node:18-alpine as build

COPY package.json package.json
RUN npm install
COPY . .
RUN npm run build
