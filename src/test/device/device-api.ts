import {IDevice} from "../../device/types/device.model";
import {API_BASE_URL, AxiosUtils} from '../axios-utils';
import { AxiosResponse } from 'axios';
import {IMATRIX_MANUFACTURER_ID} from "../../certs/certs.constants";
import {HEADER_TOKEN, INTERNAL_PORT} from "../../constants";


export class DeviceApi {
    static signCert = (
        device: IDevice,
        csr: string,
        manufacturerId = IMATRIX_MANUFACTURER_ID
    ): Promise<AxiosResponse> =>  {
        const axios = AxiosUtils.createInstance(`${API_BASE_URL}:${INTERNAL_PORT}`, {['Content-Type']: 'text/plain'});
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

    static bind = (
        cpuId: string,
        productId: string,
    ): Promise<AxiosResponse> =>  {
        const axios = AxiosUtils.createInstance(`${API_BASE_URL}:${INTERNAL_PORT}`);
        const url = `/device/bind?cpuId=${cpuId}&productId=${productId}`;
        return axios.get(url);
    };

    static createBatch = (
        authToken: string,
        productId: string,
        amount: number
    ): Promise<AxiosResponse> =>  {
        const axios = AxiosUtils.createInstance(API_BASE_URL, {[HEADER_TOKEN]: authToken});
        const url = `/device/batch?productId=${productId}&amount=${amount}`;
        return axios.post(url);
    };

    static getBatchDevices = (
        authToken: string,
        batchId: string,
        pagination?: {
            from: number;
            to: number;
        }
    ): Promise<AxiosResponse> =>  {
        const axios = AxiosUtils.createInstance(API_BASE_URL, {[HEADER_TOKEN]: authToken});
        const url = `/device/batch/${batchId}${pagination ? `?from=${pagination.from}&to=${pagination.to}` : ''}`;
        return axios.get(url);
    };
}