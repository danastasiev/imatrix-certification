import {Container, Service} from "typedi";
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
    public async createAndLoginUser(basicName = randomString()): Promise<{token: string; user: User}> {
        const email = `${generateUniqueName(basicName)}@test.com`;
        const password = generateUniqueName(`${basicName}_password`);
        const user = new User({email, password});
        const signupResponse = await AuthApi.signup(user);
        expect(signupResponse.status).toBe(200);
        const {data: { token }} = signupResponse;
        return { token, user };
    }
}