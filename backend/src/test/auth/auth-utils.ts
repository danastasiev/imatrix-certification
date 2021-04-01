import {Container, Service} from "typedi";
import { sha512 } from 'js-sha512';
import {DBProvider} from "../../db/db-provider";
import {IMATRIX_DB_NAME_TEST} from "../../db/constants";
import {generateUniqueName, randomString} from "../random-utils";
import {User} from "../../users/types/user.model";
import {AuthApi} from "./auth.api";

@Service()
export class AuthUtils {
    private db: DBProvider;

    constructor() {
        this.db = Container.get(DBProvider);
    }
    public async clearUsers(): Promise<void> {
        const knex = await this.db.createDbConnection(IMATRIX_DB_NAME_TEST);
        await knex.raw('DELETE from users;')
    }

    public async createUser(user: User): Promise<void> {
        const knex = await this.db.createDbConnection(IMATRIX_DB_NAME_TEST);
        const { email, password } = user;
        await knex.raw('insert into users(name, pass) values (?, ?);', [email, sha512(password)]);
    }

    public async createAndLoginUser(basicName = randomString()): Promise<{token: string; user: User}> {
        const name = `${generateUniqueName(basicName)}`;
        const password = generateUniqueName(`${basicName}_password`);
        const user = new User({name, password});
        await this.createUser(user);
        const loginResponse = await AuthApi.login(user);
        expect(loginResponse.status).toBe(200);
        const {data: { token }} = loginResponse;
        return { token, user };
    }
}