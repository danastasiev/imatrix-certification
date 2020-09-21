import {DBProvider} from "../db/db-provider";
import {Inject, Service} from "typedi";
import {IDevice} from "./types/device.model";

@Service()
export class DeviceRepository {

    @Inject('imatrix-db-name')
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
    public async saveNewDevice(device: IDevice): Promise<void> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);
        await knex.raw(
            'insert into device(cpuid, product_id, sn, mac, pw) values(?,?,?,?,?);',
            [device.cpuId, device.productId, device.sn, device.mac, device.pw]
        );
    }
    public async getDeviceByCpuIdAndProductId(cpuId: string, productId: string): Promise<IDevice | null> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);
        const resp = await knex.raw('select * from device where cpuid = ? AND product_id = ?;', [cpuId, productId]);
        const [ [ d ] ] = resp;
        return !d ?
            null:
            {
                cpuId,
                productId,
                sn: d.sn,
                mac: d.mac,
                pw: d.pw
            };
    }

    public async getDevicesCount(): Promise<number> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);
        const [ rows ] = await knex.raw('select count(*) device_count from device;');
        return rows[0].device_count;
    }
}