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
}