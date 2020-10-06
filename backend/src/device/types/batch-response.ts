import {IDevice} from "./device.model";

export interface IBatchResponse {
    total: number;
    devices: IDevice[];
}