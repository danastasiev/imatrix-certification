import {Service} from "typedi";
import {DeviceRepository} from "./device.repository";

@Service()
export class DeviceService {
    constructor(
        private readonly deviceRepository: DeviceRepository
    ) {}

    public doesDeviceExist(sn: string, mac: string): Promise<boolean> {
        return this.deviceRepository.doesDeviceExist(sn, mac);
    }
}