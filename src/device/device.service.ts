import {Service} from "typedi";
import {DeviceRepository} from "./device.repository";
import {IBindResponse} from "./types/bind-response";
import {HttpError} from "routing-controllers";

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
        const serialNumber = devicesNumber.toString().padStart(10, '0');
        const radiusPassword = this.generateRadiusPassword();
        const macNumber = this.MAC_START + devicesNumber + 1;
        const mac = ("000000000000" + macNumber.toString(16))
            .substr(-12).match( /.{1,2}/g )?.join( ':' );
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
}