# ---------- Build stage ----------
FROM node:20 AS build
WORKDIR /app

# Copy dependency files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the source
COPY . .

# Build for production
RUN npm run build

# ---------- Run stage ----------
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copy build output from previous stage
COPY --from=build /app/dist ./

# Expose Nginx HTTP port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
