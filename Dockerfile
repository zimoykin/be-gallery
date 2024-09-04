# Stage 1: Build the application
FROM node:20-alpine3.20 AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json, package-lock.json, and .npmrc files to the working directory
COPY package*.json ./
COPY .npmrc ./

# Build argument for npm token
ARG NPM_TOKEN

# Append the token to .npmrc
RUN echo "//npm.pkg.github.com/:_authToken=$NPM_TOKEN" > .npmrc && \
    echo "@zimoykin:registry=https://npm.pkg.github.com" >> .npmrc && \
    npm ci && \
    rm -rf .npmrc

COPY . .
# Build the application
RUN npm run build 

# Stage 2: Run the application
FROM node:20-alpine AS runner

# Set the environment variable for production
ENV NODE_ENV=production

# Set the working directory inside the container
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 8081
# Command to run the application
CMD node dist/main.js