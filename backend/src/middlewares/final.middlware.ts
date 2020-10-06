import { Middleware, ExpressMiddlewareInterface } from 'routing-controllers';
import { NextFunction, Request, Response } from 'express';

@Middleware({ type: 'after' })
export class FinalMiddleware implements ExpressMiddlewareInterface {
    public use(req: Request, res: Response, next?: NextFunction): void {
        if(req.url.startsWith('/api') && !res.headersSent) {
            res.status(404).send({message: 'Rout not found'});
        } else {
            return next && next();
        }
    }
}