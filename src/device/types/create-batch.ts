import * as Joi from "joi";
import {assignProperties, validatePayload} from "../../joi/utils";
import {MAX_DEVICES_AMOUNT} from "../../constants";
import {BatchType} from "./batch-type";

const schema = Joi.object({
    productId: Joi.string(),
    amount: Joi.number().min(1).max(MAX_DEVICES_AMOUNT),
    type: Joi.string().valid(...Object.values(BatchType)),
    description: Joi.string().max(80).optional()
});
export class CreateBatch {
    public productId!: string;
    public amount!: number;
    public type!: BatchType;
    public description?: string;

    constructor(obj: any) {
        validatePayload(obj, schema);
        assignProperties(obj, this);
    }
}