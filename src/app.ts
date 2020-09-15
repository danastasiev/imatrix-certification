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
import {BIND_DB_NAME, BIND_DB_NAME_TEST, IMATRIX_DB_NAME, IMATRIX_DB_NAME_TEST} from "./db/constance";
import {AuthRouter} from "./auth/auth.router";

export class AppHolder {
  public app: express.Express;

  constructor() {
      this.app = express();
  }
  public async init(): Promise<void> {
    await Container.get(DBProvider).checkDbConnection();
    if (process.env.IMATRIX_ENVIRONMENT === 'TEST') {
      await this.setupTestEnvironment();
    } else {
      await this.setupDevelopmentEnvironment();
    }

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
      controllers: [CertsRouter, AuthRouter],
      middlewares: [ErrorHandler]
    });
    this.app.set('port', PORT);
  }

  private async setupTestEnvironment(): Promise<void> {
    await Container.get(DBProvider).runInitialTestSchemaMigration();
    Container.set('bind-db-name', BIND_DB_NAME_TEST);
    Container.set('imatrix-db-name', IMATRIX_DB_NAME_TEST);
    console.log('TEST environment setup process completed');
  }
  private async setupDevelopmentEnvironment(): Promise<void> {
    await Container.get(DBProvider).runInitialDevelopmentSchemaMigration();
    Container.set('bind-db-name', BIND_DB_NAME);
    Container.set('imatrix-db-name', IMATRIX_DB_NAME);
    console.log('DEVELOPMENT environment setup process completed');
  }
}