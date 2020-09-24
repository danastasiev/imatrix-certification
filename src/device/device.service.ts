import {Service} from "typedi";
import {DeviceRepository} from "./device.repository";
import {IBindResponse} from "./types/bind-response";
import {HttpError} from "routing-controllers";
import {CreateBatch} from "./types/create-batch";
import {IBatch} from "./types/batch.model";
import {IBatchResponse} from "./types/batch-response";
import {GetBatchDevices} from "./types/get-batch-devices";
import {IBatchInfo} from "./types/batch-info";
import {Parser} from 'json2csv';
import {IDevice} from "./types/device.model";

@Service()
export class DeviceService {
    private readonly PASSWORD_LENGTH = 16;
    private readonly ALPHABET = "zxcvbnmlkjhgfdsaqwertyuiopZAQWSXCDERFVBGTYHNMJUIK<>LOP09876543211234567890#$";
    private readonly MAC_START = 0x00068B010000;
    private readonly MAC_END = 0x00068BFFFFFF;

    constructor(
        private readonly deviceRepository: DeviceRepository
    ) {}

    public doesDeviceExist(sn: string, mac: string): Promise<boolean> {
        return this.deviceRepository.doesDeviceExist(sn, mac);
    }

    private getNewDeviceInfo(devicesNumber: number): { serialNumber: string; radiusPassword:string; mac: string | undefined } {
        const serialNumber = devicesNumber.toString().padStart(10, '0');
        const radiusPassword = this.generateRadiusPassword();
        const macNumber = this.MAC_START + devicesNumber + 1;
        const mac = ("000000000000" + macNumber.toString(16))
            .substr(-12).match( /.{1,2}/g )?.join( ':' );
        return { serialNumber, radiusPassword,  mac};
    }

    public async bindDevice(cpuId: string, productId: string): Promise<IBindResponse> {
        const existenceDevice = await this.deviceRepository.getDeviceByCpuIdAndProductId(cpuId, productId);
        if (existenceDevice) {
            return {
                sn: existenceDevice.sn,
                mac: existenceDevice.mac,
                pw: existenceDevice.pw
            }
        }
        const devicesNumber = await this.deviceRepository.getDevicesCount();
        const { serialNumber, radiusPassword, mac} = this.getNewDeviceInfo(devicesNumber);
        if (!mac) {
            throw new HttpError(409, 'Creation mac error');
        }
        const newDevice = {
            mac,
            cpuId,
            productId,
            sn: serialNumber,
            pw: radiusPassword
        };
        await this.deviceRepository.saveNewDevice(newDevice);
        return {
            mac,
            sn: serialNumber,
            pw: radiusPassword
        }
    }

    private generateRadiusPassword(): string{
        let password = "";
        for (let i = 0; i < this.PASSWORD_LENGTH; i++)
            password += this.ALPHABET.charAt(Math.floor(Math.random() * this.ALPHABET.length));

        return password;
    }

    public async createNewBatch(createBatch: CreateBatch): Promise<IBatch> {
        const batch = await this.deviceRepository.createBatch(createBatch.productId);
        const devicesNumber = await this.deviceRepository.getDevicesCount();
        const batchDevicesRelations = [];
        const batchDevicesForDb = [];
        for (let i = 0; i< createBatch.amount; i++) {
            const deviceInfo = this.getNewDeviceInfo(devicesNumber + i);
            if (!deviceInfo.mac) {
                throw new HttpError(409, 'Creation mac error');
            }
            batchDevicesForDb.push({
                product_id: createBatch.productId,
                sn: deviceInfo.serialNumber,
                mac: deviceInfo.mac,
                pw: deviceInfo.radiusPassword
            });
            batchDevicesRelations.push({
                sn: deviceInfo.serialNumber,
                batch_id: batch.id
            })
        }
        await this.deviceRepository.createBatchOfDevices( batchDevicesRelations, batchDevicesForDb);
        return batch;
    }

    public async getBatchDevices(payload: GetBatchDevices): Promise<IBatchResponse> {
        const { batchId, to, from } = payload;
        return this.deviceRepository.getBatchDevices(batchId, to, from);
    }

    public async getBatch(id: string): Promise<IBatch | null> {
        return this.deviceRepository.getBatch(id);
    }

    public async getBatchesInfo(productId: string): Promise<IBatchInfo[]> {
        return this.deviceRepository.getBatchesInfo(productId);
    }

    public async getBatchCsv(batchId: string): Promise<string> {
        const batchDevices = await this.deviceRepository.getDevicesFromBatch(batchId);
        const dataForCsv = batchDevices.map(d => ({ ['Serial Number']: d.sn, ['Mac Address']: d.mac}));
        const json2csvParser = new Parser();
        return json2csvParser.parse(dataForCsv);
    }
    public async activateDevice(cpuId: string, serialNumber: string): Promise<void> {
        await this.deviceRepository.activateDevice(cpuId, serialNumber);
    }
    public async getDeviceBySN(sn: string): Promise<IDevice | null> {
        return this.deviceRepository.getDeviceBySN(sn);
    }
}