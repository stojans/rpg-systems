# Use the official Node.js image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files first to leverage Docker cache
COPY account-service/package*.json ./account-service/

# Install dependencies for account-service
RUN npm install --prefix account-service

# Install TypeScript and pg-migrate globally
RUN npm install -g typescript pg-migrate

# Copy the shared folder, .env file, and account-service code to the container
COPY shared /usr/src/app/shared
COPY .env /usr/src/app/.env
COPY account-service /usr/src/app/account-service

# Build the TypeScript project for account-service
RUN npm run build --prefix account-service

# Expose the port your account service will run on
EXPOSE 3001

# Run migrations and the account service
CMD ["sh", "-c", "npx knex migrate:latest --knexfile=account-service/knexfile.js && node dist/index.js"]
