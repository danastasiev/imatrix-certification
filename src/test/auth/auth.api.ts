import {AxiosResponse} from "axios";
import {User} from "../../users/types/user.model";
import {AxiosUtils} from "../axios-utils";

export class AuthApi {
    static login = (user: User): Promise<AxiosResponse> => {
        const axios = AxiosUtils.createInstance();
        const url = '/login';
        return axios.post(url, user);
    };

    static signup = (user: User): Promise<AxiosResponse> => {
        const axios = AxiosUtils.createInstance();
        const url = '/signup';
        return axios.post(url, user);
    }
}