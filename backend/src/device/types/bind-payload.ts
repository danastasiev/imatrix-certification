import * as Joi from "joi";
import {assignProperties, validatePayload} from "../../joi/utils";

const schema = Joi.object({
    cpuId: Joi.string(),
    productId: Joi.string()
});
export class BindPayload {
    public cpuId!: string;
    public productId!: string;

    constructor(obj: any) {
        validatePayload(obj, schema);
        assignProperties(obj, this);
    }
}