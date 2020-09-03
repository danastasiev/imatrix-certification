import * as Joi from 'joi';
import {validatePayload, assignProperties} from '../../joi/utils';

export interface IAssignCert {
    serialNumber: string;
    macAddress: string;
    csr: string;
}
export class AssignCert implements IAssignCert{
    public csr!: string;
    public macAddress!: string;
    public serialNumber!: string;

    private schema = Joi.object({
        serialNumber: Joi.string(),
        macAddress: Joi.string(),
        csr: Joi.string()
    });
    constructor(obj: any) {
        validatePayload(obj, this.schema);
        assignProperties(obj, this);
    }
}