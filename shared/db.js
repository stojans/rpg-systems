"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("./logger"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../.env") });
const pools = {};
const getDatabaseUrl = (serviceName) => {
    const dbUrl = process.env[`${serviceName.toUpperCase()}_DB_URL`];
    if (!dbUrl) {
        logger_1.default.error(`Database URL for ${serviceName} is not defined in the .env file`);
        throw new Error(`Database URL for ${serviceName} is not defined in the .env file`);
    }
    return dbUrl;
};
const createPool = (serviceName) => {
    if (!pools[serviceName]) {
        const dbUrl = getDatabaseUrl(serviceName);
        pools[serviceName] = new pg_1.Pool({ connectionString: dbUrl });
        logger_1.default.info(`Created pool for ${serviceName}_service with URL: ${dbUrl}`);
    }
    return pools[serviceName];
};
exports.createPool = createPool;
