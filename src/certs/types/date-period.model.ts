import * as Joi from "joi";
import {validatePayload} from "../../joi/utils";
import {HttpError} from "routing-controllers";

export class DatePeriod {
    public from!: Date;
    public to!: Date;

    private schema = Joi.object({
        from: Joi.date().timestamp('javascript'),
        to: Joi.date().timestamp('javascript')
    });

    constructor(obj:{from: number; to: number}) {
        validatePayload(obj, this.schema);
        const { from, to } = obj;
        if (from >= to) {
            throw new HttpError(400, '"to" property must be bigger than "from"')
        }
        this.from = new Date(from);
        this.to = new Date(to);
    }

}