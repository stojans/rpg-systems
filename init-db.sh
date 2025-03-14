#!/bin/bash
# init-db.sh - Create additional databases

set -e

# Create databases
psql -v ON_ERROR_STOP=1 --username "postgres" <<-EOSQL
    CREATE DATABASE account_service;
    CREATE DATABASE character_service;
    CREATE DATABASE combat_service;
EOSQL
