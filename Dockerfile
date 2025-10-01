# Use Node.js official image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source code
COPY . .

# Expose the port your app listens on (3200 as per app.js)
EXPOSE 3200

# Start the app
CMD ["node", "app.js"]
