import * as Joi from "joi";
import {assignProperties, validatePayload} from "../../joi/utils";
import {MAX_DEVICES_AMOUNT} from "../../constants";

const schema = Joi.object({
    productId: Joi.string(),
    amount: Joi.number().min(1).max(MAX_DEVICES_AMOUNT)
});
export class CreateBatch {
    public productId!: string;
    public amount!: number;

    constructor(obj: any) {
        validatePayload(obj, schema);
        assignProperties(obj, this);
    }
}