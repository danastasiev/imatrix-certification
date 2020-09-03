import {
    Body,
    Controller,
    Delete,
    Get,
    HttpError,
    Param,
    Post,
    Put,
    Req,
    UseBefore
} from "routing-controllers";
import {CertsService} from "./certs.service";
import {DeviceService} from "../device/device.service";
import {AssignCert, IAssignCert} from "./types/assign-cert.model";

@Controller('/certs')
export class CertsRouter {
    constructor(
        private readonly certsService: CertsService,
        private readonly deviceService: DeviceService
    ) {}

    @Post('/sign')
    public async sign(
        @Body() body: IAssignCert
    ): Promise<string>{
        const payload = new AssignCert(body);
        const {serialNumber, macAddress, csr} = payload;
        const exists = await this.deviceService.doesDeviceExist(serialNumber, macAddress);
        if (!exists) {
            throw new HttpError(404, `Device does not exist: sn = ${serialNumber}, mac = ${macAddress}`);
        }
        const {cert, csrFileName} = await this.certsService.signCert(csr, serialNumber);
        this.certsService.removeCsrFile(csrFileName);
        return cert;
    }
}