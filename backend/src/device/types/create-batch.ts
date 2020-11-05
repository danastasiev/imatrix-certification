import * as Joi from "joi";
import {assignProperties, macAddressSchema, validatePayload} from "../../joi/utils";
import {MAX_DEVICES_AMOUNT} from "../../constants";
import {BatchType} from "./batch-type";
import {HttpError} from "routing-controllers";

const schema = Joi.object({
    productId: Joi.string(),
    amount: Joi.number().min(1).max(MAX_DEVICES_AMOUNT),
    type: Joi.string().valid(...Object.values(BatchType)),
    description: Joi.string().allow('').max(80).optional(),
    firstMac: macAddressSchema.optional(),
    macs: Joi.array().items(macAddressSchema).optional(),
});
export class CreateBatch {
    public productId!: string;
    public amount!: number;
    public type!: BatchType;
    public description?: string;
    public firstMac?: string;
    public macs?: string[];

    constructor(obj: any) {
        validatePayload(obj, schema);
        assignProperties(obj, this);
        if (this.type === BatchType.BLE && (!this.firstMac && !this.macs)) {
            throw new HttpError(400, 'For creation BLE batch fist mac address or list of macs addresses have to be specified');
        }
    }
}