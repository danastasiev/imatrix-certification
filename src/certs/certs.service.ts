import {Service} from 'typedi';
const openssl = require('openssl-nodejs');
import * as path from 'path';


@Service()
export class CertsService {
    private rootCaCrtPath: string;
    private rootCaKeyPath: string;
    private keyPassword: string;
    constructor() {
        this.rootCaCrtPath = path.resolve(__dirname, '../../certs/rootCA.crt');
        this.rootCaKeyPath = path.resolve(__dirname, '../../certs/rootCA.key');
        this.keyPassword = '1111'
    }
    public signCert(csr: string, serialNumber: string): Promise<string> {
        return new Promise((res, reject) => {
            openssl([
                    'x509',
                    '-req',
                    '-in',
                    { name:`${serialNumber}.imatrixsys.com.scr`, buffer: Buffer.from(csr, 'utf8') },
                    '-CA',
                    this.rootCaCrtPath,
                    '-CAkey',
                    this.rootCaKeyPath,
                    '-passin',
                    `pass:${this.keyPassword}`,
                    '-CAcreateserial',
                    '-days',
                    '360',
                    '-sha256'],
                    (err: Error[], buffer: Buffer[])=> {
                        if (buffer.length === 0) {
                            reject(err);
                            return;
                        }
                        res(buffer.toString());
                    }
            );
        });
    }
}