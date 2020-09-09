import {DBProvider} from "../db/db-provider";
import {Inject, Service} from "typedi";

@Service()
export class DeviceRepository {

    @Inject('bind-db-name')
    private dbName!: string;

    constructor(
        private readonly dbProvider: DBProvider
    ) {}
    public async doesDeviceExist(sn: string, mac: string): Promise<boolean> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);
        const resp = await knex.raw('select * from device where sn=? and mac=?;', [sn, mac]);
        const [ rows ] = resp;
        return rows.length !== 0;
    }
}