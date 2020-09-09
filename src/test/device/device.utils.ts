import {Container, Service} from "typedi";
import {DBProvider} from "../../db/db-provider";
import {IDevice} from "../../device/device.model";
import {BIND_DB_NAME_TEST} from "../../db/constance";

@Service()
export class DeviceUtils {
    private db: DBProvider;

    constructor() {
        this.db = Container.get(DBProvider);
    }

    private randomIntFromInterval(min: number, max: number): string {
        return String(Math.floor(Math.random() * (max - min + 1) + min));
    }
    private generateNumber(): string {
        return this.randomIntFromInterval(10000000, 999999999);
    }

    public generateDevice(): IDevice {
        return {
            cpuid: this.generateNumber(),
            productId: this.generateNumber(),
            sn: this.generateNumber(),
            mac: this.generateNumber(),
            pw: this.generateNumber()
        }
    }

    public async clearDevices(): Promise<void> {
        const knex = await this.db.createDbConnection(BIND_DB_NAME_TEST);
        await knex.raw('DELETE from device;')
    }
    public async createDevice(device: IDevice): Promise<void> {
        const knex = await this.db.createDbConnection(BIND_DB_NAME_TEST);
        const {cpuid, productId, sn, mac, pw} = device;
        await knex.raw('INSERT into device values (?,?,?,?,?);', [cpuid, productId, sn, mac, pw])
    }
}