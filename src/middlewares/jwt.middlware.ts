import { verify } from 'jsonwebtoken';
import {HEADER_TOKEN, SECRET} from "../constants";

export const jwtVerificationMiddleware = (req: any, res: any, next: any) => {
    const token = req.headers[HEADER_TOKEN];
    if (!token) {
        return res.status(401).send({message: 'No token provided'});
    }
    const decodedToken = new Buffer(token, 'base64').toString('utf-8');
    try {
        const decoded = verify(decodedToken, SECRET);
        req.currentUser = (decoded as any).data;
        return next();
    }catch (e) {
        return res.status(401).send({message: 'Invalid token'});
    }
};
