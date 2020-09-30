import {
    BodyParam,
    ContentType,
    Controller,
    Get,
    HttpError, OnUndefined,
    Param,
    Post,
    QueryParam,
    Res,
    UseBefore
} from "routing-controllers";
import * as Joi from "joi";
import {Response} from 'express';
import {DeviceService} from "./device.service";
import {IBatch} from "./types/batch.model";
import {jwtVerificationMiddleware} from "../middlewares/jwt.middlware";
import {CreateBatch} from "./types/create-batch";
import {ProductService} from "../product/product.service";
import {IBatchResponse} from "./types/batch-response";
import {DEFAULT_LIMIT, DEFAULT_OFFSET} from "../constants";
import {GetBatchDevices} from "./types/get-batch-devices";
import {IBatchInfo} from "./types/batch-info";
import {validatePayload} from "../joi/utils";
import {BatchType} from "./types/batch-type";
import {CheckMacPayload} from "./types/check-mac-payload";

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
        @QueryParam('amount') amount: number,
        @QueryParam('type', { required: false }) type: BatchType = BatchType.WIFI,
        @BodyParam('description', { required: false }) description?: string,
        @BodyParam('firstMac', { required: false }) firstMac?: string
    ): Promise<IBatch>{
       const payload = new CreateBatch({ productId, amount, type, description, firstMac });
       const product = await this.productService.getProduct(payload.productId);
       if (product === null) {
           throw new HttpError(409, `Product does not exist, id=${payload.productId}`);
       }
       if (payload.firstMac) {
           await this.deviceService.checkMacSequence(payload.firstMac, payload.amount);
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

    @Get('/batch/all/:productId')
    @UseBefore(jwtVerificationMiddleware)
    public async getBatchesInfo(
        @Param('productId') productId: string,
    ): Promise<IBatchInfo[]> {
        validatePayload(
        { productId },
            Joi.object({ productId: Joi.string() })
        );
        return this.deviceService.getBatchesInfo(productId);
    }

    @Get('/batch/download/:batchId')
    @UseBefore(jwtVerificationMiddleware)
    @ContentType('application/octet-stream')
    public async downloadBatch(
        @Param('batchId') batchId: string,
        @Res() res: Response
    ): Promise<any> {
        validatePayload(
            { batchId },
            Joi.object({ batchId: Joi.string() })
        );
        const batch = await this.deviceService.getBatch(batchId);
        if (batch === null) {
            throw new HttpError(409, `Batch does not exist, id=${batchId}`);

        }
        const batchCsv = await this.deviceService.getBatchCsv(batchId);
        res.set('Content-Disposition', `attachment;filename="batch-${batchId}.csv"`);
        return res.send(batchCsv);
    }

    @Get('/mac/available')
    @UseBefore(jwtVerificationMiddleware)
    @OnUndefined(200)
    public async checkMacSequence(
        @QueryParam('mac') mac: string,
        @QueryParam('amount') amount: number
    ): Promise<void> {
        const payload = new CheckMacPayload({ mac, amount });
        await this.deviceService.checkMacSequence(payload.mac, payload.amount);
    }

}