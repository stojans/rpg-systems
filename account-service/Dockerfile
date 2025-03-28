# Use the official Node.js image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files first to leverage Docker cache
COPY account-service/package*.json ./
COPY shared/package*.json ./shared/


RUN npm install

# Install dependencies for account-service

RUN npm install --prefix shared


# Install TypeScript and pg-migrate globally
RUN npm install -g typescript pg-migrate


COPY account-service /usr/src/app/account-service
COPY shared /usr/src/app/shared
# Copy the shared folder, .env file, and account-service code to the container
COPY .env /usr/src/app/.env
COPY tsconfig.json ./tsconfig.json

# Build the TypeScript project for account-service
RUN npm run build --prefix account-service

# Expose the port your account service will run on
EXPOSE 3001

# Run migrations and start the account service
CMD ["sh", "-c", "npx knex migrate:latest --knexfile=account-service/knexfile.js && node dist/account-service/src/index.js"]
