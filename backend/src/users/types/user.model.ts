import * as Joi from "joi";
import {assignProperties, validatePayload} from "../../joi/utils";

const schema = Joi.object({
    email: Joi.string().email(),
    password: Joi.string().max(128),
    role: Joi.object()
});

export class User {
    public email!: string;
    public password!: string;
    public role!: {
        id: number,
        name: string,
        permissions: [string]
    };

    constructor(obj: any) {
        validatePayload(obj, schema);
        assignProperties(obj, this);
    }

}