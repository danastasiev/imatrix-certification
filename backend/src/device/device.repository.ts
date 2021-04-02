import {DBProvider} from "../db/db-provider";
import {Inject, Service} from "typedi";
import { v4 as uuidv4 } from 'uuid';
import {IDevice} from "./types/device.model";
import {IBatch} from "./types/batch.model";
import {IBatchResponse} from "./types/batch-response";
import {IBatchInfo} from "./types/batch-info";
import {MAX_DEVICES_AMOUNT} from "../constants";
import {CreateBatch} from "./types/create-batch";

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
            `insert into device(product_id, sn, mac${device.cpuId ? ', cpuid' : ''}) values(?,?,?${device.cpuId ? ',?' : ''});`,
            device.cpuId ? [device.productId, device.sn, device.mac, device.cpuId] :
                [device.productId, device.sn, device.mac]
        );
    }
    public async activateDevice(cpuId: string, serialNumber: string): Promise<void> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);
        await knex.raw('update device set cpuid=? where sn=?', [cpuId, serialNumber]);
    }
    private getOptionalDevice(resp: any): IDevice | null {
        const [ [ d ] ] = resp;
        return !d ?
            null:
            {
                cpuId: d.cpuid,
                productId: d.product_id,
                sn: d.sn,
                mac: d.mac
            };
    }
    public async getDeviceByCpuIdAndProductId(cpuId: string, productId: string): Promise<IDevice | null> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);
        const resp = await knex.raw('select * from device where cpuid = ? AND product_id = ?;', [cpuId, productId]);
        return this.getOptionalDevice(resp);
    }

    public async getDeviceBySN(sn: string): Promise<IDevice | null> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);
        const resp = await knex.raw('select * from device where sn = ?;', [sn]);
        return this.getOptionalDevice(resp);
    }

    public async getDevicesCount(): Promise<number> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);
        const [ rows ] = await knex.raw('select count(*) device_count from device;');
        return rows[0].device_count;
    }


    public async createBatch(createBatchPayload: CreateBatch): Promise<IBatch> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);
        const {productId, type, description} = createBatchPayload;
        const id = uuidv4();
        await knex.raw('insert into batch (batch_id, product_id, batch_type, description) values (?, ?, ?, ?)',
            [id, productId, type, description || '']);
        const [ [ batch ] ] = await knex.raw('select * from batch where batch_id=?', [id]);
        return {
            id,
            productId,
            type,
            created: new Date(batch.created),
            description: batch.description
        };
    }

    public async createBatchOfDevices(
        batchDevicesRelations: {sn: string; batch_id: string}[],
        batchDevicesForDb: { product_id: string; sn: string; mac: string}[]
    ): Promise<void> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);
        await knex('device').insert(batchDevicesForDb);
        await knex('batch_device').insert(batchDevicesRelations);
    }

    public async getDevicesFromBatch(batchId: string, limit: number = MAX_DEVICES_AMOUNT, offset: number = 0): Promise<IDevice[]> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);
        let sql = `select device.* from device
                        inner join batch_device on device.sn = batch_device.sn
                        inner join batch on batch_device.batch_id = batch.batch_id
                     where batch.batch_id = ? limit ? offset ?;`;
        const [ rows ] = await knex.raw(sql, [batchId, limit, offset]);
        return rows.map((device:any) => ({
            cpuId: device.cpuid,
            productId: device.product_id,
            sn: device.sn,
            mac: device.mac
        }));
    }

    public async getBatchDevices(batchId: string, limit: number, offset: number): Promise<IBatchResponse> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);

        const devices = await this.getDevicesFromBatch(batchId, limit, offset);

        const sql = `select count(*) total from device
                        inner join batch_device on device.sn = batch_device.sn
                        inner join batch on batch_device.batch_id = batch.batch_id
                     where batch.batch_id = ?`;
        const [ res ] = await knex.raw(sql, [batchId]);
        return { devices, total: res[0].total };
    }

    public async getBatch(id: string): Promise<IBatch | null> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);
        const [ rows ] = await knex.raw('select * from batch where batch_id=?;', [id]);

        return rows.length === 0 ?
            null :
            {
                id,
                productId: rows[0].product_id,
                created: new Date(rows[0].created),
                type: rows[0].batch_type,
                description: rows[0].description
            };
    }

    public async getBatchesInfo(productId: string, batchId?: string): Promise<IBatchInfo[]> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);
        const sql = `select batch.*, count(bd.sn) registered, sum(if(d.cpuid is null, 0, 1)) activated from batch
                        inner join batch_device bd on batch.batch_id = bd.batch_id
                        inner join device d on d.sn = bd.sn
                    where batch.product_id=? ${batchId ? ` and batch.batch_id=?` : ''}
                    group by bd.batch_id;`;
        const [ rows ] = await knex.raw(sql, batchId ? [productId, batchId]: [productId]);
        return rows.map((r: any) => ({
            productId,
            id: r.batch_id,
            type: r.batch_type,
            description: r.description,
            created: new Date(r.created),
            registered: r.registered,
            activated: r.activated
        }));
    }

    public async isMacSequenceAvailable(mac: string, lastMac: string): Promise<boolean> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);
        const sql = 'select * from device where mac >= ? and mac <= ?';
        const [ rows ] = await knex.raw(sql, [mac, lastMac]);
        return rows.length === 0;
    }

    public async getAllSN(): Promise<string[]> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);
        const sql = 'select sn from device';
        const [ rows ] = await knex.raw(sql);
        return rows.map((r: any) => r.sn);
    }

    public async doesMacExist(mac: string): Promise<boolean> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);
        const sql = 'select * from device where mac = ?';
        const [ rows ] = await knex.raw(sql, [mac]);
        return rows.length !== 0;
    }

    public async getDevicesByMacAddresses(macs: string[]): Promise<IDevice[]> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);
        const sql = `select * from device where mac in (${macs.map(() => '?').join(',')})`;
        const [ rows ] = await knex.raw(sql, macs);
        return rows.map((device:any) => ({
            cpuId: device.cpuid,
            productId: device.product_id,
            sn: device.sn,
            mac: device.mac
        }));
    }
}