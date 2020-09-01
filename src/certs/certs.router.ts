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
import {RepoRequest} from "../middlewares/repo-request.model";
import {CertsService} from "./certs.service";

@Controller('/certs')
export class CertsRouter {
    constructor(
        private readonly certsService: CertsService
    ) {}

    @Post('/sign')
    public async sign(
        @Body() body: {serialNumber: string; macAddress: string; csr: string}
    ): Promise<string>{
        const {serialNumber, csr} = body;
        return this.certsService.signCert(csr, serialNumber);
    }
}