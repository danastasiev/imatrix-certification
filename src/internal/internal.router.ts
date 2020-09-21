import {Body, Controller, HttpError, Post, QueryParam, Get} from "routing-controllers";
import {CertsService} from "../certs/certs.service";
import {DeviceService} from "../device/device.service";
import {AssignCert} from "../certs/types/assign-cert.model";
import {OTHER_MANUFACTURER_ID} from "../certs/certs.constants";
import {IBindResponse} from "../device/types/bind-response";
import {BindPayload} from "../device/types/bind-payload";

@Controller()
export class InternalRouter {
    constructor(
        private readonly certsService: CertsService,
        private readonly deviceService: DeviceService
    ) {}

    @Post('/certs/sign')
    public async sign(
        @Body() csr: string,
        @QueryParam('serialNumber') serialNumber: string,
        @QueryParam('macAddress') macAddress: string,
        @QueryParam('manufacturerId') manufacturerId: string,
    ): Promise<string>{
        const payload = new AssignCert({csr, serialNumber, macAddress, manufacturerId});
        if (payload.manufacturerId !== OTHER_MANUFACTURER_ID) {
            const exists = await this.deviceService.doesDeviceExist(payload.serialNumber, payload.macAddress);
            if (!exists) {
                throw new HttpError(404,
                    `Device does not exist: sn = ${payload.serialNumber}, mac = ${payload.macAddress}`
                );
            }
        }
        const {cert, csrFileName} = await this.certsService.signCert(
            payload.csr,
            payload.serialNumber,
            payload.manufacturerId);
        this.certsService.removeCsrFile(csrFileName);
        await this.certsService.saveLog(payload.serialNumber);
        return cert;
    }

    @Get('/device/bind')
    public async bindDevice(
        @QueryParam('cpuId') cpuId: string,
        @QueryParam('productId') productId: string,
    ): Promise<IBindResponse> {
        const payload = new BindPayload({ cpuId, productId });
        return this.deviceService.bindDevice(payload.cpuId, payload.productId);
    }
}