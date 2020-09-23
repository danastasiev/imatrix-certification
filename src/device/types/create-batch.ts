import * as Joi from "joi";
import {assignProperties, validatePayload} from "../../joi/utils";

const schema = Joi.object({
    productId: Joi.string(),
    amount: Joi.number().min(1).max(5000)
});
export class CreateBatch {
    public productId!: string;
    public amount!: number;

    constructor(obj: any) {
        validatePayload(obj, schema);
        assignProperties(obj, this);
    }
}