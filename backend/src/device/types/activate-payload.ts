import * as Joi from "joi";
import {assignProperties, macAddressSchema, validatePayload} from "../../joi/utils";

const schema = Joi.object({
    cpuId: Joi.string(),
    sn: Joi.string(),
    mac: macAddressSchema,
    productId: Joi.string()
});
export class ActivatePayload {
    public cpuId!: string;
    public sn!: string;
    public mac!: string;
    public productId!: string;

    constructor(obj: any) {
        validatePayload(obj, schema);
        assignProperties(obj, this);
    }
}