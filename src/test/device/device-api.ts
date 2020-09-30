import {IDevice} from "../../device/types/device.model";
import {API_BASE_URL, AxiosUtils} from '../axios-utils';
import { AxiosResponse } from 'axios';
import {IMATRIX_MANUFACTURER_ID} from "../../certs/certs.constants";
import {HEADER_TOKEN, INTERNAL_PORT} from "../../constants";
import {BatchType} from "../../device/types/batch-type";


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

    static activate = (
        cpuId: string,
        sn: string,
    ): Promise<AxiosResponse> =>  {
        const axios = AxiosUtils.createInstance(`${API_BASE_URL}:${INTERNAL_PORT}`);
        const url = `/device/bind?cpuId=${cpuId}&sn=${sn}`;
        return axios.post(url);
    };

    static createBatch = (
        authToken: string,
        productId: string,
        amount: number,
        type?: BatchType,
        body?: {description?: string; firstMac?: string}
    ): Promise<AxiosResponse> =>  {
        const axios = AxiosUtils.createInstance(API_BASE_URL, {[HEADER_TOKEN]: authToken});
        const url = `/device/batch?productId=${productId}&amount=${amount}${type ? `&type=${type}` : ''}`;
        return body ? axios.post(url, body ) : axios.post(url);
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
    static getAllBatches = (
        authToken: string,
        productId: string
    ): Promise<AxiosResponse> =>  {
        const axios = AxiosUtils.createInstance(API_BASE_URL, {[HEADER_TOKEN]: authToken});
        const url = `/device/batch/all/${productId}`;
        return axios.get(url);
    };
    static downloadBatch = (
        authToken: string,
        batchId: string
    ): Promise<AxiosResponse> =>  {
        const axios = AxiosUtils.createInstance(API_BASE_URL, {[HEADER_TOKEN]: authToken});
        const url = `/device/batch/download/${batchId}`;
        return axios.get(url);
    };
    static checkMacSequence = (
        authToken: string,
        mac: string,
        amount: number
    ): Promise<AxiosResponse> =>  {
        const axios = AxiosUtils.createInstance(API_BASE_URL, {[HEADER_TOKEN]: authToken});
        const url = `/device/mac/available?mac=${mac}&amount=${amount}`;
        return axios.get(url);
    };
}