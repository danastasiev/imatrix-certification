import * as Joi from 'joi';
import {validatePayload, assignProperties} from '../../joi/utils';
import {IMATRIX_MANUFACTURER_ID, OTHER_MANUFACTURER_ID} from "../certs.constants";

export interface IAssignCert {
    serialNumber: string;
    macAddress: string;
    csr: string;
    manufacturerId: string;
}
const schema = Joi.object({
    serialNumber: Joi.string(),
    macAddress: Joi.string(),
    csr: Joi.string(),
    manufacturerId: Joi.string().only(IMATRIX_MANUFACTURER_ID, OTHER_MANUFACTURER_ID)
});
export class AssignCert implements IAssignCert{
    public csr!: string;
    public macAddress!: string;
    public serialNumber!: string;
    public manufacturerId!: string;

    constructor(obj: any) {
        validatePayload(obj, schema);
        assignProperties(obj, this);
    }
}