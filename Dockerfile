# Use an official Node.js runtime as base image
FROM node:20-slim

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the port your app listens on
EXPOSE 5000

# Start the server in dev mode
CMD ["npm", "run", "dev"]