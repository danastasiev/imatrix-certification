import {IDevice} from "../../device/device.model";
import {API_BASE_URL, AxiosUtils} from '../axios-utils';
import { AxiosResponse } from 'axios';
import {IMATRIX_MANUFACTURER_ID} from "../../certs/certs.constants";
import {HEADER_TOKEN} from "../../constants";


export class DeviceApi {
    static signCert = (
        device: IDevice,
        csr: string,
        manufacturerId = IMATRIX_MANUFACTURER_ID
    ): Promise<AxiosResponse> =>  {
        const axios = AxiosUtils.createInstance(API_BASE_URL, {['Content-Type']: 'text/plain'});
        const url = `/certs/sign?serialNumber=${device.sn}&macAddress=${device.mac}&manufacturerId=${manufacturerId}`;
        return axios.post(url, csr);
    };

    static getLogsBySerialNumber = (
        authToken: string,
        serialNumber: string
    ): Promise<AxiosResponse> =>  {
        const axios = AxiosUtils.createInstance(API_BASE_URL, {[HEADER_TOKEN]: authToken});
        const url = `/certs/${serialNumber}`;
        return axios.get(url);
    };

    static getLogsByTimePeriod = (
        authToken: string,
        from: number,
        to: number
    ): Promise<AxiosResponse> =>  {
        const axios = AxiosUtils.createInstance(API_BASE_URL, {[HEADER_TOKEN]: authToken});
        const url = `/certs/${from}/${to}`;
        return axios.get(url);
    };
}