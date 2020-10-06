import * as Joi from "joi";
import {assignProperties, validatePayload} from "../../joi/utils";

const schema = Joi.object({
    cpuId: Joi.string(),
    sn: Joi.string()
});
export class ActivatePayload {
    public cpuId!: string;
    public sn!: string;

    constructor(obj: any) {
        validatePayload(obj, schema);
        assignProperties(obj, this);
    }
}