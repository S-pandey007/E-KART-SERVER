import pinoHttp from "pino-http";
import logger from "../config/logger.js";

const httpLogger = pinoHttp({
  logger,
  serializers: {
    err: pinoHttp.stdSerializers.err,
    req: pinoHttp.stdSerializers.req,
    res: pinoHttp.stdSerializers.res,
  },
});

export default httpLogger;
