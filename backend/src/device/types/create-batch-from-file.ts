import {assignProperties, macAddressSchema, validatePayload} from "../../joi/utils";
import * as Joi from "joi";

const schema = Joi.object({
    productId: Joi.string(),
    description: Joi.string().allow('').max(80).optional(),
});

export class CreateBatchFromFile {
    public productId!: string;
    public description?: string;

    constructor(obj: any) {
        validatePayload(obj, schema);
        assignProperties(obj, this);
    }
}