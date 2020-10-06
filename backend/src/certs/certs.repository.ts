import {Inject, Service} from "typedi";
import {DBProvider} from "../db/db-provider";
import {CertLog} from "./types/cert-log.model";
import {DatePeriod} from "./types/date-period.model";

@Service()
export class CertsRepository {

    @Inject('bind-db-name')
    private dbName!: string;

    constructor(
        private readonly dbProvider: DBProvider
    ) {}

    public async saveLog(sn: string): Promise<void> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);
        await knex.raw('insert into certs_log(sn) values (?);', [sn]);
    }

    public async getLogsBySN(sn: string): Promise<CertLog[]> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);
        const resp = await knex.raw('select * from certs_log where sn=?;', [sn]);
        const [ rows ] = resp;
        return rows.map((r: any) => ({serialNumber: r.sn, issuedDate: new Date(r.issued_date)}))
    }

    public async getLogsByDatePeriod(datePeriod: DatePeriod): Promise<CertLog[]> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);
        const { from, to } = datePeriod;
        const resp = await knex.raw('select * from certs_log where issued_date between ? and ?;', [from.toISOString(), to.toISOString()]);
        const [ rows ] = resp;
        return rows.map((r: any) => ({serialNumber: r.sn, issuedDate: new Date(r.issued_date)}))
    }
}