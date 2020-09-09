import {IDevice} from "../../device/device.model";
import {API_BASE_URL, AxiosUtils} from '../axios-utils';
import { AxiosResponse } from 'axios';


export class DeviceApi {
    static signCert = (
        device: IDevice,
        csr: string
    ): Promise<AxiosResponse> =>  {
        const axios = AxiosUtils.createInstance(API_BASE_URL, {['Content-Type']: 'text/plain'});
        const url = `/certs/sign?serialNumber=${device.sn}&macAddress=${device.mac}`;
        return axios.post(url, csr);
    }
}