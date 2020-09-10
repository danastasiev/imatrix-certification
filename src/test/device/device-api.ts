import {IDevice} from "../../device/device.model";
import {API_BASE_URL, AxiosUtils} from '../axios-utils';
import { AxiosResponse } from 'axios';
import {IMATRIX_MANUFACTURER_ID} from "../../certs/certs.constants";


export class DeviceApi {
    static signCert = (
        device: IDevice,
        csr: string,
        manufacturerId = IMATRIX_MANUFACTURER_ID
    ): Promise<AxiosResponse> =>  {
        const axios = AxiosUtils.createInstance(API_BASE_URL, {['Content-Type']: 'text/plain'});
        const url = `/certs/sign?serialNumber=${device.sn}&macAddress=${device.mac}&manufacturerId=${manufacturerId}`;
        return axios.post(url, csr);
    }
}