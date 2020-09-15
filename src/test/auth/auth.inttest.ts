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
        const email = `${generateUniqueName('auth')}@test.com`;
        const password = generateUniqueName('auth_password');
        user = new User({email, password});
    });
    it('User can login after signup', async () => {
        let loginResponse = await AuthApi.login(user);
        expect(loginResponse.status).toBe(401);
        const signupResponse = await AuthApi.signup(user);
        expect(signupResponse.status).toBe(200);
        const { data } = signupResponse;
        expect(data?.token).toBeDefined();
        loginResponse = await AuthApi.login(user);
        expect(loginResponse.status).toBe(200);
        expect(loginResponse.data?.token).toBeDefined();
    });
    it('User can not signup if user with same email already exists', async () => {
        let signupResponse = await AuthApi.signup(user);
        expect(signupResponse.status).toBe(200);
        signupResponse = await AuthApi.signup(user);
        expect(signupResponse.status).toBe(409);
    });
    it('Check login with invalid credentials', async () => {
        const signupResponse = await AuthApi.signup(user);
        expect(signupResponse.status).toBe(200);
        const invalidUser = new User({...user, password: `${user.password}1`});
        let loginResponse = await AuthApi.login(invalidUser);
        expect(loginResponse.status).toBe(401);
        loginResponse = await AuthApi.login(user);
        expect(loginResponse.status).toBe(200);
    });
});