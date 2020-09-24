import {IBatch} from "./batch.model";

export interface IBatchInfo extends IBatch{
    registered: number;
    activated: number;
}