import {Service} from 'typedi';
const openssl = require('openssl-nodejs');
import * as path from 'path';
import * as fs from 'fs';
import {HttpError} from "routing-controllers";
import {OPENSSL_DIR_NAME} from "../constants";
import {IMATRIX_MANUFACTURER_ID, OTHER_MANUFACTURER_ID} from "./certs.constants";


@Service()
export class CertsService {
    private certs: {[key: string] : { ca: string;  keyCa: string; password: string}};
    private clientCnf: string;
    constructor() {
        this.certs = {
            [IMATRIX_MANUFACTURER_ID]: {
                ca: path.resolve(__dirname, '../../certs/client-certs/imatrix-rootCA.crt'),
                keyCa: path.resolve(__dirname, '../../certs/client-certs/imatrix-rootCA.key'),
                password: 'test'
            },
            [OTHER_MANUFACTURER_ID]: {
                ca: path.resolve(__dirname, '../../certs/client-certs/other-rootCA.crt'),
                keyCa: path.resolve(__dirname, '../../certs/client-certs/other-rootCA.key'),
                password: 'test'
            },
        };
        this.clientCnf = path.resolve(__dirname, '../../certs/client.cnf');
    }
    public signCert(csr: string, serialNumber: string, manufacturerId: string): Promise<{cert: string; csrFileName: string}> {
        const { ca, keyCa, password } = this.certs[manufacturerId];
        return new Promise((res, reject) => {
            const csrFileName = `${serialNumber}.imatrixsys.com.scr`;
            openssl([
                    'x509',
                    '-req',
                    '-extfile',
                    this.clientCnf,
                    '-extensions',
                    'v3_req',
                    '-in',
                    { name:csrFileName, buffer: Buffer.from(csr, 'utf8') },
                    '-CA',
                    ca,
                    '-CAkey',
                    keyCa,
                    '-passin',
                    `pass:${password}`,
                    '-CAcreateserial',
                    '-days',
                    '12600',
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