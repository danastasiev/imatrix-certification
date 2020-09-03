import * as express from 'express';
import 'reflect-metadata';
import { useExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';
import * as bodyParser from 'body-parser';

import {PORT} from "./constants";
import {CertsRouter} from "./certs/certs.router";
import {ErrorHandler} from "./middlewares/error-handler";
import {transports, format} from 'winston';
import {logger} from 'express-winston';
import {DBProvider} from "./db/db-provider";

(async () => {
  try {
    await Container.get(DBProvider).checkDbConnection();
    const app = express();
    app.use(logger({
      transports: [
        new transports.Console()
      ],
      format: format.combine(
          format.splat(),
          format.simple()
      ),
      meta: true,
      msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}}'
    }));
    const router = express.Router();
    router.use(bodyParser.urlencoded({ extended: false }));
    router.use(bodyParser.json());
    app.use('/', router);
    useContainer(Container);
    useExpressServer(app, {
      defaultErrorHandler: false,
      controllers: [CertsRouter],
      middlewares: [ErrorHandler]
    });
    app.listen( PORT, () => {
      console.log( `server started at http://localhost:${ PORT }` );
    } );
  }catch (e) {
    console.log(`Failed to start server: ${e}\n`);
    process.exit(1)
  }
})();
