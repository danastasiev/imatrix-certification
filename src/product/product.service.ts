import {ProductRepository} from "./product.repository";
import {Service} from "typedi";
import {IProduct} from "./types/product.model";

@Service()
export class ProductService {
    constructor(
        private readonly productRepository: ProductRepository
    ) {}

    public async getProducts(): Promise<IProduct[]> {
        return this.productRepository.getProducts();
    }

    public async getProduct(id: string): Promise<IProduct | null> {
        return this.productRepository.getProduct(id);
    }
}