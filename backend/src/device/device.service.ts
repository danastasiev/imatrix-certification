import {Container, Service} from "typedi";
import * as es from 'event-stream';
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
import {generateSn} from "../test/random-utils";
import {CreateBatchFromFile} from "./types/create-batch-from-file";
import {macAddressSchema} from "../joi/utils";
import {BatchType} from "./types/batch-type";
import {Request} from "express";
import {ConfigService} from "../config";

@Service()
export class DeviceService {
    private readonly PASSWORD_LENGTH = 16;
    private readonly ALPHABET = "zxcvbnmlkjhgfdsaqwertyuiopZAQWSXCDERFVBGTYHNMJUIK<>LOP09876543211234567890#$";
    private readonly MAC_START = 0x00068B010000;
    private readonly MAC_END = 0x00068BFFFFFF;

    constructor(
        private readonly deviceRepository: DeviceRepository,
        private readonly configService: ConfigService
    ) {
        this.configService = Container.get(ConfigService);
    }

    public doesDeviceExist(sn: string, mac: string): Promise<boolean> {
        return this.deviceRepository.doesDeviceExist(sn, mac);
    }

    private getMACFromNumber(macNumber: number): string | undefined {
        return ("000000000000" + macNumber.toString(16))
            .substr(-12).match( /.{1,2}/g )?.join( ':' );
    }

    private getNumberFromMac(mac: string): number {
        return parseInt(mac.replace(/:/g, ''), 16);
    }

    private async getNewSN(allSn: string[]): Promise<string> {
        const sn = generateSn();
        if (allSn.includes(sn)) {
            return this.getNewSN(allSn);
        }
        return sn;
    }

    private async getNewDeviceInfo(
        devicesNumber: number,
        allSn: string[],
        predefinedMac?: number
    ): Promise<{ serialNumber: string; radiusPassword:string; mac: string | undefined }> {
        const serialNumber = await this.getNewSN(allSn);
        const radiusPassword = this.generateRadiusPassword();
        const macNumber = predefinedMac ?? this.MAC_START + devicesNumber + 1;
        const mac = this.getMACFromNumber(macNumber);
        return { serialNumber, radiusPassword,  mac};
    }

    public async bindDevice(cpuId: string, productId: string): Promise<IBindResponse> {
        const existenceDevice = await this.deviceRepository.getDeviceByCpuIdAndProductId(cpuId, productId);
        if (existenceDevice) {
            return {
                sn: existenceDevice.sn,
                mac: existenceDevice.mac
            }
        }
        const devicesNumber = await this.deviceRepository.getDevicesCount();
        const allSn = await this.deviceRepository.getAllSN();
        const { serialNumber, radiusPassword, mac} = await this.getNewDeviceInfo(devicesNumber, allSn);
        if (!mac) {
            throw new HttpError(409, 'Creation mac error');
        }
        const newDevice = {
            mac,
            cpuId,
            productId,
            sn: serialNumber
        };
        await this.deviceRepository.saveNewDevice(newDevice);
        return {
            mac,
            sn: serialNumber
        }
    }

    private generateRadiusPassword(): string{
        let password = "";
        for (let i = 0; i < this.PASSWORD_LENGTH; i++)
            password += this.ALPHABET.charAt(Math.floor(Math.random() * this.ALPHABET.length));

        return password;
    }

    public async createNewBatch(createBatch: CreateBatch): Promise<IBatchInfo> {
        const batch = await this.deviceRepository.createBatch(createBatch);
        const devicesNumber = await this.deviceRepository.getDevicesCount();
        const batchDevicesRelations = [];
        const batchDevicesForDb = [];
        const definedFirstMac = createBatch.firstMac && this.getNumberFromMac(createBatch.firstMac);
        const allSn = await this.deviceRepository.getAllSN();
        for (let i = 0; i < createBatch.amount; i++) {
            const predefinedMac = createBatch.macs ?
                this.getNumberFromMac(createBatch.macs[i]) :
                typeof definedFirstMac === 'number' ? definedFirstMac + i : undefined;
            const deviceInfo = await this.getNewDeviceInfo(
                devicesNumber + i,
                allSn,
                predefinedMac
            );
            if (!deviceInfo.mac) {
                throw new HttpError(409, 'Creation mac error');
            }
            batchDevicesForDb.push({
                product_id: createBatch.productId,
                sn: deviceInfo.serialNumber,
                mac: deviceInfo.mac
            });
            batchDevicesRelations.push({
                sn: deviceInfo.serialNumber,
                batch_id: batch.id
            });
            allSn.push(deviceInfo.serialNumber);
        }
        await this.deviceRepository.createBatchOfDevices( batchDevicesRelations, batchDevicesForDb);
        return this.getBatchInfo(batch.productId, batch.id);
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

    public async getBatchInfo(productId: string, batchId: string): Promise<IBatchInfo> {
        const [ batch ] = await this.deviceRepository.getBatchesInfo(productId, batchId);
        return batch;
    }

    public async getBatchCsv(batchId: string): Promise<string> {
        const batchDevices = await this.deviceRepository.getDevicesFromBatch(batchId);
        const dataForCsv = batchDevices.map(d => ({
            ['Serial Number']: d.sn,
            ['Mac Address']: d.mac,
            ['QR Content']: `${this.configService.getBaseCloudHostUrl()}/app?sn=${d.sn}&mac=${d.mac}`
        }));
        const json2csvParser = new Parser();
        return json2csvParser.parse(dataForCsv);
    }
    public async activateDevice(cpuId: string, serialNumber: string): Promise<void> {
        await this.deviceRepository.activateDevice(cpuId, serialNumber);
    }
    public async getDeviceBySN(sn: string): Promise<IDevice | null> {
        return this.deviceRepository.getDeviceBySN(sn);
    }

    public async checkMacSequence(mac: string, amount: number): Promise<void> {
        const lastMacNumber = this.getNumberFromMac(mac) + amount;
        const lastMac = this.getMACFromNumber(lastMacNumber);
        const isMacSequenceAvailable = await this.deviceRepository.isMacSequenceAvailable(mac, lastMac!);
        if (!isMacSequenceAvailable) {
            throw new HttpError(409, 'MAC addresses are not available');
        }
    }

    public async doesMacExist(mac: string): Promise<boolean> {
        return this.deviceRepository.doesMacExist(mac);
    }

    private isMacValid(mac: string): boolean {
        const { error } = macAddressSchema.validate(mac);
        return !error;
    }
    private async getMacAddressesFromFile(
        stream: Request
    ): Promise<string[]> {
        const res: string[] = [];
        const fileReading = new Promise((res, rej) => {
            stream.on('end', () => res());
            stream.on('error', (err) => rej(err));
        });
        const readLineStream = es.mapSync( (line = '') => {
            const trimmedLine = line.trim();
            if(trimmedLine) {
                const macValid = this.isMacValid(trimmedLine);
                if (!macValid) {
                    stream.emit('error', new HttpError(409, `File is not valid, ${trimmedLine} - is not valid mac address`));
                    readLineStream.destroy();
                }
                res.push(trimmedLine);
            }
        });
        stream
            .pipe(es.split())
            .pipe(readLineStream);

        await fileReading;
        if (res.length === 0) {
            throw new HttpError(409, 'File does not contain mac addresses');
        }
        return res;
    }

    public async createBatchFromFile(
        stream: Request,
        payload: CreateBatchFromFile
    ): Promise<IBatchInfo> {
        const macStrings = await this.getMacAddressesFromFile(stream);
        const allocatedDevices = await this.deviceRepository.getDevicesByMacAddresses(macStrings);
        if (allocatedDevices.length !== 0) {
            throw new HttpError(409, `MAC addresses already allocated: ${allocatedDevices.map((d: IDevice) => d.mac).join(',')}`)
        }

        return this.createNewBatch(
            new CreateBatch({
                amount: macStrings.length,
                productId: payload.productId,
                description: payload.description,
                type: BatchType.BLE,
                macs: macStrings
            })
        );
    }
}