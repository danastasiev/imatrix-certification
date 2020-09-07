import {
    Body,
    Controller,
    HttpError,
    Post,
    QueryParam
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
        @Body() csr: string,
        @QueryParam('serialNumber') serialNumber: string,
        @QueryParam('macAddress') macAddress: string
    ): Promise<string>{
        const payload = new AssignCert({csr, serialNumber, macAddress});
        const {serialNumber: sn, macAddress: mac, csr: csrVerified} = payload;
        const exists = await this.deviceService.doesDeviceExist(sn, mac);
        if (!exists) {
            throw new HttpError(404, `Device does not exist: sn = ${sn}, mac = ${mac}`);
        }
        const {cert, csrFileName} = await this.certsService.signCert(csrVerified, sn);
        this.certsService.removeCsrFile(csrFileName);
        return cert;
    }
}