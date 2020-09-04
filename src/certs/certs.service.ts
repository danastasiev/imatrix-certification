import {Service} from 'typedi';
const openssl = require('openssl-nodejs');
import * as path from 'path';
import * as fs from 'fs';
import {HttpError} from "routing-controllers";
import {OPENSSL_DIR_NAME} from "../constants";


@Service()
export class CertsService {
    private rootCaCrtPath: string;
    private rootCaKeyPath: string;
    private keyPassword: string;
    constructor() {
        this.rootCaCrtPath = path.resolve(__dirname, '../../certs/rootCA.crt');
        this.rootCaKeyPath = path.resolve(__dirname, '../../certs/rootCA.key');
        this.keyPassword = 'test'
    }
    public signCert(csr: string, serialNumber: string): Promise<{cert: string; csrFileName: string}> {
        return new Promise((res, reject) => {
            const csrFileName = `${serialNumber}.imatrixsys.com.scr`;
            openssl([
                    'x509',
                    '-req',
                    '-in',
                    { name:csrFileName, buffer: Buffer.from(csr, 'utf8') },
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
                    (err: Buffer[], buffer: Buffer[])=> {
                        if (buffer.length === 0) {
                            reject(new HttpError(409, `Invalid CSR: ${err.toString()}`));
                            return;
                        }
                        res({csrFileName, cert: buffer.toString()});
                    }
            );
        });
    }
    public removeCsrFile(fileName: string): void {
        const filePath = path.resolve(__dirname, `../../${OPENSSL_DIR_NAME}/${fileName}`);
        fs.unlink(filePath, (err) => {
            if(err) {
                console.log(`Cannot remove csr file: ${err}`)
            }
        });
    }
}