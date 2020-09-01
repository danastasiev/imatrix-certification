import express from 'express';
import 'reflect-metadata';
import { useExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';
import * as bodyParser from 'body-parser';

import {PORT} from "./constants";
import {DBProvider} from "./db/db-provider";
import {CertsRouter} from "./certs/certs.router";
import {ErrorHandler} from "./middlewares/error-handler";


try {
  const app = express();
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
