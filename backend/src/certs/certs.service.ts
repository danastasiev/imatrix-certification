import {Service} from 'typedi';
// tslint:disable-next-line:no-require-imports
const openssl = require('openssl-nodejs');
import * as path from 'path';
import * as fs from 'fs';
import {HttpError} from "routing-controllers";
import {OPENSSL_DIR_NAME} from "../constants";
import {IMATRIX_MANUFACTURER_ID, OTHER_MANUFACTURER_ID} from "./certs.constants";
import {CertsRepository} from "./certs.repository";
import {CertLog} from "./types/cert-log.model";
import {DatePeriod} from "./types/date-period.model";


@Service()
export class CertsService {
    private certs: {[key: string] : { ca: string;  keyCa: string; clientCnf: string}};
    constructor(
        private readonly certsRepository: CertsRepository
    ) {
        this.certs = {
            [IMATRIX_MANUFACTURER_ID]: {
                ca: path.resolve(__dirname, '../../certs/client-certs/imatrix-rootCA.crt'),
                keyCa: path.resolve(__dirname, '../../certs/client-certs/imatrix-rootCA.key'),
                clientCnf: path.resolve(__dirname, '../../certs/client-certs/imatrix-client.cnf')
            },
            [OTHER_MANUFACTURER_ID]: {
                ca: path.resolve(__dirname, '../../certs/client-certs/inventek-rootCA.crt'),
                keyCa: path.resolve(__dirname, '../../certs/client-certs/inventek-rootCA.key'),
                clientCnf: path.resolve(__dirname, '../../certs/client-certs/inventek-client.cnf')
            },
        };
    }
    public signCert(csr: string, serialNumber: string, manufacturerId: string): Promise<{cert: string; csrFileName: string}> {
        const { ca, keyCa, clientCnf } = this.certs[manufacturerId];
        return new Promise((res, reject) => {
            const csrFileName = `${serialNumber}.imatrixsys.com.scr`;
            openssl([
                    'x509',
                    '-req',
                    '-extfile',
                    clientCnf,
                    '-extensions',
                    'v3_req',
                    '-in',
                    { name:csrFileName, buffer: Buffer.from(csr, 'utf8') },
                    '-CA',
                    ca,
                    '-CAkey',
                    keyCa,
                    '-CAcreateserial',
                    '-days',
                    '12784',
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

    public async saveLog(sn: string, orgId: string): Promise<void> {
        await this.certsRepository.saveLog(sn, orgId);
    }

    public async getLogsBySN(sn: string): Promise<CertLog[]> {
        return this.certsRepository.getLogsBySN(sn);
    }

    public async getLogsByDatePeriod(datePeriod: DatePeriod): Promise<CertLog[]> {
        return this.certsRepository.getLogsByDatePeriod(datePeriod);
    }
}