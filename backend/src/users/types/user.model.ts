import * as Joi from "joi";
import {assignProperties, validatePayload} from "../../joi/utils";

const schema = Joi.object({
    name: Joi.string().max(60),
    password: Joi.string().max(128)
});

export class User {
    public name!: string;
    public password!: string;

    constructor(obj: any) {
        validatePayload(obj, schema);
        assignProperties(obj, this);
    }

}