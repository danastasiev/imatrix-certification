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

export class AppHolder {
  public app: express.Express;

  constructor() {
      this.app = express();
  }
  public async init(): Promise<void> {
    await Container.get(DBProvider).checkDbConnection();
    this.app.use(logger({
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
    this.app.use('/', router);
    useContainer(Container);
    useExpressServer(this.app, {
      defaultErrorHandler: false,
      controllers: [CertsRouter],
      middlewares: [ErrorHandler]
    });
    this.app.set('port', PORT);
  }
}