import * as express from 'express';
import 'reflect-metadata';
import { useExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

import {ErrorHandler} from "./middlewares/error-handler";
import {transports, format} from 'winston';
import {logger} from 'express-winston';
import * as https from "https";
import * as fs from "fs";
import * as path from "path";

export class AppHolder {
  public app: express.Express;
  public port: number;
  private routers: Function[];

  constructor(port: number, routers: Function[]) {
      this.app = express();
      this.port = port;
      this.routers = routers;
      this.init()
  }
  private init(): void {
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
    this.app.use(cors({ credentials: true, origin: true }));
    this.app.use('/', router);
    useContainer(Container);
    useExpressServer(this.app, {
      defaultErrorHandler: false,
      controllers: this.routers,
      middlewares: [ErrorHandler],
      routePrefix: '/api'
    });
    this.app.set('port', this.port);
  }

  public start(): void {
    const certPath = path.resolve(__dirname, '../certs/server.crt');
    const keyPath = path.resolve(__dirname, '../certs/server.key');
    const server = https.createServer(
        {
          cert: fs.readFileSync(certPath, 'utf8'),
          key: fs.readFileSync(keyPath, 'utf8')
        },
        this.app
    );
    server.listen(this.port);
    server.on('error', (error: any) => {
      console.log(`Start server error: ${error}`);
      process.exit(1);
    });
    server.on('listening', () => {
      console.log( `server started at https://localhost:${this.port}/` );
    });
  }
}