import {Body, Controller, Get, HttpError, Param, Post, QueryParam, UseBefore} from "routing-controllers";
import {CertsService} from "../certs/certs.service";
import {DeviceService} from "./device.service";
import {AssignCert} from "../certs/types/assign-cert.model";
import {OTHER_MANUFACTURER_ID} from "../certs/certs.constants";
import {IBindResponse} from "./types/bind-response";
import {BindPayload} from "./types/bind-payload";
import {IBatch} from "./types/batch.model";
import {jwtVerificationMiddleware} from "../middlewares/jwt.middlware";
import {CreateBatch} from "./types/create-batch";
import {ProductService} from "../product/product.service";
import {IBatchResponse} from "./types/batch-response";
import {DEFAULT_LIMIT, DEFAULT_OFFSET} from "../constants";
import {GetBatchDevices} from "./types/get-batch-devices";

@Controller('/device')
export class DeviceRouter {
    constructor(
        private readonly deviceService: DeviceService,
        private readonly productService: ProductService
    ) {}

    @Post('/batch')
    @UseBefore(jwtVerificationMiddleware)
    public async sign(
        @QueryParam('productId') productId: string,
        @QueryParam('amount') amount: number
    ): Promise<IBatch>{
       const payload = new CreateBatch({ productId, amount });
       const product = await this.productService.getProduct(payload.productId);
       if (product === null) {
           throw new HttpError(409, `Product does not exist, id=${payload.productId}`);
       }
       return this.deviceService.createNewBatch(payload);
    }
    @Get('/batch/:batchId')
    @UseBefore(jwtVerificationMiddleware)
    public async getBatchDevices(
        @Param('batchId') batchId: string,
        @QueryParam('from', { required: false }) from: number = DEFAULT_OFFSET,
        @QueryParam('to', { required: false }) to: number = DEFAULT_LIMIT
    ): Promise<IBatchResponse>{
       const payload = new GetBatchDevices({ batchId, from, to });
       const batch = await this.deviceService.getBatch(payload.batchId);
       if (batch === null) {
           throw new HttpError(409, `Batch does not exist, id=${payload.batchId}`);

       }
       return this.deviceService.getBatchDevices(payload);
    }
}