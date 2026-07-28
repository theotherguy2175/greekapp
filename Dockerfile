# Stage 1: Install dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the application
FROM node:22-alpine AS builder
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client and create the database schema
ENV DATABASE_URL="file:./seed.db"
RUN npx prisma generate && npx prisma db push

# Build Next.js
RUN npm run build

# Stage 3: Production image
FROM node:22-alpine AS runner
RUN apk add --no-cache tini
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy the seed database (empty schema, used to initialize new volumes)
COPY --from=builder /app/seed.db ./seed.db

# Copy lexicon data
COPY --from=builder /app/data ./data

# Create data directory for SQLite and set permissions
RUN mkdir -p /app/data/db && chown -R nextjs:nodejs /app

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENTRYPOINT ["tini", "--"]
CMD ["./docker-entrypoint.sh"]

#docker buildx build --platform linux/amd64 -t git.casteel.pw/ccasteel/koine-search:latest --push .
