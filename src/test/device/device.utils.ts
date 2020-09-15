import {Container, Service} from "typedi";
import {DBProvider} from "../../db/db-provider";
import {IDevice} from "../../device/device.model";
import {BIND_DB_NAME_TEST} from "../../db/constance";
import {generateNumber} from "../random-utils";

@Service()
export class DeviceUtils {
    private db: DBProvider;

    constructor() {
        this.db = Container.get(DBProvider);
    }

    public generateDevice(): IDevice {
        return {
            cpuid: generateNumber(),
            productId: generateNumber(),
            sn: generateNumber(),
            mac: generateNumber(),
            pw: generateNumber()
        }
    }

    public async clearDevices(): Promise<void> {
        const knex = await this.db.createDbConnection(BIND_DB_NAME_TEST);
        await knex.raw('DELETE from device;')
    }
    public async clearLogs(): Promise<void> {
        const knex = await this.db.createDbConnection(BIND_DB_NAME_TEST);
        await knex.raw('DELETE from certs_log;')
    }
    public async createDevice(device: IDevice): Promise<void> {
        const knex = await this.db.createDbConnection(BIND_DB_NAME_TEST);
        const {cpuid, productId, sn, mac, pw} = device;
        await knex.raw('INSERT into device values (?,?,?,?,?);', [cpuid, productId, sn, mac, pw])
    }
}