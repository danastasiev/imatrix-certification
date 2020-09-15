import {
    Body,
    Controller,
    HttpError,
    Post,
    QueryParam,
    Get,
    Param, UseBefore
} from "routing-controllers";
import {CertsService} from "./certs.service";
import {DeviceService} from "../device/device.service";
import {AssignCert, IAssignCert} from "./types/assign-cert.model";
import {OTHER_MANUFACTURER_ID} from "./certs.constants";
import {CertLog} from "./types/cert-log.model";
import {DatePeriod} from "./types/date-period.model";
import {jwtVerificationMiddleware} from "../middlewares/jwt.middlware";

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

    @Get('/:sn')
    @UseBefore(jwtVerificationMiddleware)
    public async getLogsBySN(
        @Param('sn') sn: string
    ): Promise<CertLog[]> {
        return this.certsService.getLogsBySN(sn);
    }

    @Get('/:from/:to')
    @UseBefore(jwtVerificationMiddleware)
    public async getLogsByDatePeriod(
        @Param('from') from: number,
        @Param('to') to: number
    ): Promise<CertLog[]> {
        const payload = new DatePeriod({from, to});

        return this.certsService.getLogsByDatePeriod(payload);
    }
}