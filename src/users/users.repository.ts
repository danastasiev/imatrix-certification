import {Inject, Service} from "typedi";
import {DBProvider} from "../db/db-provider";
import {User} from "./types/user.model";

@Service()
export class UsersRepository {
    @Inject('imatrix-db-name')
    private dbName!: string;

    constructor(
        private readonly dbProvider: DBProvider
    ) {}

    public async getUser(email: string): Promise<User | null> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);
        const resp = await knex.raw('select * from users where email=?;', [email]);
        const [ rows ] = resp;
        if (rows.length) {
            return new User(rows[0]);
        }
        return null;
    }

    public async saveUser(user: User): Promise<void> {
        const knex = await this.dbProvider.createDbConnection(this.dbName);
        const { email, password } = user;
        await knex.raw('insert into users(email, password) values (?, ?);', [email, password]);
    }



}