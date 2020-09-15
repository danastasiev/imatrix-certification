import {Service} from "typedi";
import { sign } from 'jsonwebtoken';

import { sha256 } from 'js-sha256';
import {SECRET} from "../constants";
import {User} from "../users/types/user.model";


@Service()
export class AuthService {
    public verify(user: User, receivedPassword: string): string {
        const { password } = user;
        const receivedHash = sha256(receivedPassword);
        if (password === receivedHash) {
            return this.getToken(user);
        }
        throw Error('Invalid password')
    }

    public getToken(user: User): string {
        const { email } = user;
        const token =  sign({
            data: { email}
        }, SECRET, { expiresIn: '24h' });
        return new Buffer(token).toString('base64');
    }
}