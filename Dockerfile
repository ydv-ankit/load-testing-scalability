FROM node:18-alpine
WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]