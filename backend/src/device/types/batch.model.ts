import {BatchType} from "./batch-type";

export interface IBatch {
    id: string;
    productId: string;
    created: Date;
    type: BatchType;
    description?: string;
}