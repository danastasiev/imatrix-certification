import {Controller, Get, UseBefore} from "routing-controllers";
import {ProductService} from "../product.service";
import {jwtVerificationMiddleware} from "../../middlewares/jwt.middlware";
import {IProduct} from "./product.model";

@Controller('/product')
export class ProductRouter {
    constructor(
        private readonly productService: ProductService
    ) {}

    @Get()
    @UseBefore(jwtVerificationMiddleware)
    public async getProducts(): Promise<IProduct[]> {
        return this.productService.getProducts();
    }
}