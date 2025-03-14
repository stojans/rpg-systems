# Use the official Node.js image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files first to leverage Docker cache
COPY combat-service/package*.json ./
COPY shared/package*.json ./shared/


RUN npm install

# Install dependencies for account-service

RUN npm install --prefix shared


# Install TypeScript and pg-migrate globally
RUN npm install -g typescript pg-migrate


COPY combat-service /usr/src/app/combat-service
COPY shared /usr/src/app/shared
# Copy the shared folder, .env file, and account-service code to the container
COPY .env /usr/src/app/.env
COPY tsconfig.json ./tsconfig.json

# Build the TypeScript project for account-service
RUN npm run build --prefix combat-service

# Expose the port your account service will run on
EXPOSE 3003

# Run migrations and start the account service
CMD ["sh", "-c", "npx knex migrate:latest --knexfile=combat-service/knexfile.js && node dist/combat-service/src/index.js"]
