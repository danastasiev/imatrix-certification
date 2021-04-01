import {Inject, Service} from "typedi";
import {DBProvider} from "../db/db-provider";
import {IProduct} from "./types/product.model";

@Service()
export class ProductRepository {
    @Inject('imatrix-db-name')
    private dbName!: string;

    constructor(
        private readonly dbProvider: DBProvider
    ) {}

    public async getProducts(): Promise<IProduct[]> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);
        const [ rows ] = await knex.raw('select * from products;');
        return rows.map((r: any) => ({ id: r.product_id, name: r.name }))
    }
    public async getProduct(id: string): Promise<IProduct | null> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);
        const [ rows ] = await knex.raw('select * from products where product_id=?;', [id]);
        return rows.length ? { id: rows[0].product_id, name: rows[0].name } : null;
    }
}