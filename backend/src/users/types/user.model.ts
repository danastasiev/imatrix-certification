import * as Joi from "joi";
import {assignProperties, validatePayload} from "../../joi/utils";

const schema = Joi.object({
    email: Joi.string().email(),
    password: Joi.string().max(128)
});

export class User {
    public email!: string;
    public password!: string;

    constructor(obj: any) {
        validatePayload(obj, schema);
        assignProperties(obj, this);
    }

}