import {Controller, Post, Body, HttpError, OnUndefined} from "routing-controllers";
import {AuthService} from "./auth.service";
import {UsersService} from "../users/users.service";
import {User} from "../users/types/user.model";

@Controller()
export class AuthRouter {
    constructor(
        private readonly authService: AuthService,
        private readonly userService: UsersService
    ) {}

    @Post('/login')
    public async login(
        @Body() body: {email: string; password: string}
    ): Promise<{token: string}>{
        const payload = new User(body);
        const user = await this.userService.getUser(payload.email);
        if (user === null) {
            throw new HttpError(401, 'Invalid credentials');
        }
        if (!this.userService.isUserAdmin(user)) throw new HttpError(403, 'No admin rights!');
        try{
            const token = this.authService.verify(user, payload.password);
            return {token};
        } catch {
            throw new HttpError(401, 'Invalid credentials');
        }
    }
}