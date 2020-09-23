import {Container} from "typedi";
import {DeviceUtils} from "./device.utils";
import {AuthUtils} from "../auth/auth-utils";
import {IProduct} from "../../product/types/product.model";
import {DeviceApi} from "./device-api";

const deviceUtils = Container.get(DeviceUtils);
const authUtils = Container.get(AuthUtils);
let authToken: string;
let product: IProduct;

describe('Device batches test', () => {
    afterEach(async () => {
        await authUtils.clearUsers();
        await deviceUtils.clearDevices();
        await deviceUtils.clearLogs();
        await deviceUtils.clearProducts();
    });
    afterAll(async () => {
        await authUtils.clearUsers();
    });
    beforeAll(async() => {
        const { token } = await authUtils.createAndLoginUser('logsUser');
        authToken = token;
    });
    beforeEach(async () => {
        product = await deviceUtils.createProduct();
    });

    it('Basic create new device batch test', async () => {
        const response = await DeviceApi.createBatch(authToken, product.id, 10);
        expect(response.status).toBe(200);
        const { data } = response;
        expect(data.id).toBeDefined();
        expect(data.productId).toBeDefined();
        expect(data.created).toBeDefined();
        const getResponse = await DeviceApi.getBatchDevices(authToken, data.id);
        expect(getResponse.status).toBe(200);
        const { data: getData } = getResponse;
        expect(getData?.devices).toHaveLength(10);
        expect(getData?.total).toBe(10);
    });
});