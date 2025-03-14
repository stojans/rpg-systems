import { createLogger, format, transports } from "winston";

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message }) => {
          return `${level.toUpperCase()}: ${message}`;
        })
      ),
    }),
    new transports.File({
      filename: "logs/app.log",
      level: "info",
    }),
  ],
});

export default logger;
