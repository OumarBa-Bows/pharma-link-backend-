FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of your application's source code from your host to your image filesystem.
COPY . .

# Build the application if needed (uncomment if you have a build step)
RUN npm run build

# Define the command to run your app using CMD which defines your runtime
CMD [ "node", "build/app.js" ]