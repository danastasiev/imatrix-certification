import {Service} from "typedi";
import {UsersRepository} from "./users.repository";
import {User} from "./types/user.model";

@Service()
export class UsersService {
    constructor(private readonly usersRepository: UsersRepository) {
    }

    public async getUser(email: string): Promise<User | null> {
        return this.usersRepository.getUser(email);
    }

    public async isUserAdmin(user: User): Promise<Boolean | null> {
        const permissions = user.role.permissions || [];
        return permissions.includes('SYSTEM:MANAGE');
    }
}