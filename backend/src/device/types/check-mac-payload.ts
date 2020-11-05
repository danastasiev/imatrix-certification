import * as Joi from "joi";
import {assignProperties, validatePayload, macAddressSchema} from "../../joi/utils";
import {MAX_DEVICES_AMOUNT} from "../../constants";

const schema = Joi.object({
    mac: macAddressSchema,
    amount: Joi.number().max(MAX_DEVICES_AMOUNT).optional()
});
export class CheckMacPayload {
    public mac!: string;
    public amount!: number;

    constructor(obj: any) {
        validatePayload(obj, schema);
        assignProperties(obj, this);
    }
}