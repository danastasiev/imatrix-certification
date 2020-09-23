import {Container} from "typedi";
import {AuthUtils} from "./auth-utils";
import {User} from "../../users/types/user.model";
import {generateUniqueName} from "../random-utils";
import {AuthApi} from "./auth.api";

const authUtils = Container.get(AuthUtils);

describe('Basic authentication test', () => {
    let user: User;
    afterEach(async () => {
        await authUtils.clearUsers();
    });
    beforeEach(async () => {
        const name = `${generateUniqueName('auth')}`;
        const password = generateUniqueName('auth_password');
        user = new User({name, password});
        await authUtils.createUser(user);
    });
    it('User can login after signup', async () => {
        const loginResponse = await AuthApi.login(user);
        expect(loginResponse.status).toBe(200);
        expect(loginResponse.data?.token).toBeDefined();
    });
    it('Check login with invalid credentials', async () => {
        const invalidUser = new User({...user, password: `${user.password}1`});
        let loginResponse = await AuthApi.login(invalidUser);
        expect(loginResponse.status).toBe(401);
        loginResponse = await AuthApi.login(user);
        expect(loginResponse.status).toBe(200);
    });
});