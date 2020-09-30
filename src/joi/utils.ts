import {Schema} from 'joi';
import * as Joi from 'joi';
import {HttpError} from "routing-controllers";
export const validatePayload = (obj: object, schema: Schema) => {
    const result = schema.validate(obj, {
        allowUnknown: true,
        presence: 'required',
        abortEarly: false,
        skipFunctions: true,
        stripUnknown: true,
        convert: true
    });
    if(result.error) {
        throw new HttpError(400, result.error.message)
    }
};
export const assignProperties = <T extends Object>(obj: any, self: T): void => {
    Object.getOwnPropertyNames(obj).forEach(prop => {
        if (obj[prop] !== undefined) {
            (self as any)[prop] = obj[prop];
        }
    });
};
export const macAddressSchema = Joi.string().regex(/^([0-9a-fA-F]{2}[:]?){5}([0-9a-fA-F]{2})$/);