import * as Joi from "joi";
import {assignProperties, validatePayload} from "../../joi/utils";

const schema = Joi.object({
    batchId: Joi.string(),
    from: Joi.number().min(0).max(5000),
    to: Joi.number().min(0).max(5000)
});
export class GetBatchDevices {
    public batchId!: string;
    public from!: number;
    public to!: number;

    constructor(obj: any) {
        validatePayload(obj, schema);
        assignProperties(obj, this);
    }
}