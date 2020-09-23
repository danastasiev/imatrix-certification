import {DBProvider} from "../db/db-provider";
import {Inject, Service} from "typedi";
import { v4 as uuidv4 } from 'uuid';
import {IDevice} from "./types/device.model";
import {IBatch} from "./types/batch.model";
import {IBatchResponse} from "./types/batch-response";

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
    public async saveNewDevice(device: IDevice): Promise<void> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);
        await knex.raw(
            `insert into device(product_id, sn, mac, pw${device.cpuId ? ', cpuid' : ''}) values(?,?,?,?${device.cpuId ? ',?' : ''});`,
            device.cpuId ? [device.productId, device.sn, device.mac, device.pw, device.cpuId] :
                [device.productId, device.sn, device.mac, device.pw]
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


    public async createBatch(productId: string): Promise<IBatch> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);
        const id = uuidv4();
        await knex.raw('insert into batch (batch_id, product_id) values (?, ?)', [id, productId]);
        const [ [ batch ] ] = await knex.raw('select * from batch where batch_id=?', [id]);
        return { id, productId, created: new Date(batch.created) };
    }

    public async createBatchOfDevices(
        batchDevicesRelations: {sn: string; batch_id: string}[],
        batchDevicesForDb: { product_id: string; sn: string; mac: string; pw: string }[]
    ): Promise<void> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);
        await knex('device').insert(batchDevicesForDb);
        await knex('batch_device').insert(batchDevicesRelations);
    }

    public async getBatchDevices(batchId: string, limit: number, offset: number): Promise<IBatchResponse> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);
        let sql = `select device.* from device
                        inner join batch_device on device.sn = batch_device.sn
                        inner join batch on batch_device.batch_id = batch.batch_id
                     where batch.batch_id = ? limit ? offset ?;`;
        const [ rows ] = await knex.raw(sql, [batchId, limit, offset]);
        const devices = rows.map((device:any) => ({
            cpuId: device.cpuid,
            productId: device.product_id,
            sn: device.sn,
            mac: device.mac,
            pw: device.pw
        }));
        sql = `select count(*) total from device
                        inner join batch_device on device.sn = batch_device.sn
                        inner join batch on batch_device.batch_id = batch.batch_id
                     where batch.batch_id = ?`;
        const [ res ] = await knex.raw(sql, [batchId]);
        return { devices, total: res[0].total };
    }

    public async getBatch(id: string): Promise<IBatch | null> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);
        const [ rows ] = await knex.raw('select * from batch where batch_id=?;', [id]);

        return rows.length === 0 ? null : { id, productId: rows[0].batch_id, created: new Date(rows[0].created) };
    }
}