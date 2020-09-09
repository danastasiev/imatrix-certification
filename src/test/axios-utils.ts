import axios, { AxiosError, AxiosResponse, Method } from 'axios';
import * as https from 'https';

export const API_BASE_URL = 'https://localhost:443';
const DEFAULT_MINIMUM_ERROR_CODE = 400;

export interface AepRestError {
    code: string;
    message: string;
    debugInfo?: string;
}
export interface AepErrorResponse {
    requestUuid: string;
    errors: AepRestError[];
}
export class AxiosErrorResponse<T> extends Error {
    response: AxiosResponse<T>;

    constructor(methodType: Method, response: AxiosResponse) {
        super(`${methodType} failed:
    status: ${response.status},
    data: ${JSON.stringify(response.data, null, 2)}`);
        this.response = response;
    }
}

export class AxiosUtils {
    public static httpsAgent = new https.Agent({
        rejectUnauthorized: false
    });

    public static createInstance = (
        baseUrl: string = API_BASE_URL,
        headers = {}
    ) => {
        const instance = axios.create({
            baseURL: baseUrl,
            headers: {
                ...headers
            },
            httpsAgent: AxiosUtils.httpsAgent
        });
        instance.interceptors.response.use(
            (response: AxiosResponse<any>) => response,
            (error: AxiosError) => error.response as AxiosResponse<AepErrorResponse>
        );

        return instance;
    };
}
