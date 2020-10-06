import {Container, Service} from "typedi";
import { v4 as uuidv4 } from 'uuid';
import {DBProvider} from "../../db/db-provider";
import {IDevice} from "../../device/types/device.model";
import {BIND_DB_NAME_TEST, IMATRIX_DB_NAME_TEST} from "../../db/constants";
import {generateNumber, randomString} from "../random-utils";
import {IProduct} from "../../product/types/product.model";

@Service()
export class DeviceUtils {
    private db: DBProvider;

    constructor() {
        this.db = Container.get(DBProvider);
    }

    public generateDevice(): IDevice {
        return {
            cpuId: generateNumber(),
            productId: generateNumber(),
            sn: generateNumber(),
            mac: generateNumber(),
            pw: generateNumber()
        }
    }

    public async clearDevices(): Promise<void> {
        const knex = await this.db.createDbConnection(BIND_DB_NAME_TEST);
        await knex.raw('DELETE from device;');
        await knex.raw('DELETE from batch;');
        await knex.raw('DELETE from batch_device;');
    }
    public async clearLogs(): Promise<void> {
        const knex = await this.db.createDbConnection(BIND_DB_NAME_TEST);
        await knex.raw('DELETE from certs_log;')
    }
    public async createDevice(device: IDevice): Promise<void> {
        const knex = await this.db.createDbConnection(BIND_DB_NAME_TEST);
        await knex.raw(
            `insert into device(product_id, sn, mac, pw${device.cpuId ? ', cpuid' : ''}) values(?,?,?,?${device.cpuId ? ',?' : ''});`,
            device.cpuId ? [device.productId, device.sn, device.mac, device.pw, device.cpuId] :
                [device.productId, device.sn, device.mac, device.pw]
        );
    }
    public async clearProducts(): Promise<void> {
        const knex = await this.db.createDbConnection(IMATRIX_DB_NAME_TEST);
        await knex.raw('DELETE from product;')
    }
    public async createProduct(): Promise<IProduct> {
        const knex = await this.db.createDbConnection(IMATRIX_DB_NAME_TEST);
        const name = randomString();
        const id = uuidv4();
        await knex.raw('insert into product(product_id, name) values(?,?);', [id, name])
        return { id, name };
    }
}