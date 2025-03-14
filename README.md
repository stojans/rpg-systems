# RPG Systems
A scalable, turn-based RPG system built with TypeScript, Node.js, PostgreSQL, and Docker. This system consists of three microservices:

**Account Service** – Manages user authentication and accounts.

**Character Service** – Handles character creation, stats, and inventory.

**Combat Service** – Implements turn-based combat mechanics.



## Features

 -JWT authentication & Redis caching
 
 -Turn-based combat with time-limited actions
 
 -Item and inventory management
 
 -PostgreSQL with foreign data wrappers (FDW) for cross-service data access
 
 -Dockerized for easy deployment

## Setup

1. Clone the repo
2. Run ```npm install```
3. Run ```docker-compose up --build```
