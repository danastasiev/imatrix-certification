import {Container} from "typedi";
import {DeviceUtils} from "./device.utils";
import {AuthUtils} from "../auth/auth-utils";
import {IProduct} from "../../product/types/product.model";
import {DeviceApi} from "./device-api";
import {IBatchInfo} from "../../device/types/batch-info";
import {randomString} from "../random-utils";
import {BatchType} from "../../device/types/batch-type";
import {IDevice} from "../../device/types/device.model";

const deviceUtils = Container.get(DeviceUtils);
const authUtils = Container.get(AuthUtils);
let authToken: string;
let product: IProduct;
jest.setTimeout(30000);
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
        const { token } = await authUtils.createAndLoginUser('test_batches_user');
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
    it('Get batches for product test', async () => {
        let createBatchResponse = await DeviceApi.createBatch(authToken, product.id, 10);
        expect(createBatchResponse.status).toBe(200);
        createBatchResponse = await DeviceApi.createBatch(authToken, product.id, 5);
        expect(createBatchResponse.status).toBe(200);
        const getBatchesResponse = await DeviceApi.getAllBatches(authToken, product.id);
        expect(getBatchesResponse.status).toBe(200);
        const { data } = getBatchesResponse;
        expect(data).toHaveLength(2);
        data.forEach((batch:IBatchInfo) => {
            expect(batch.created).toBeDefined();
            expect(batch.activated).toBeDefined();
            expect(batch.registered).toBeDefined();
            expect(batch.type).toBeDefined();
            expect(batch.description).toBeDefined();
        });
        data.sort(
            (b1: IBatchInfo, b2: IBatchInfo) => new Date(b1.created).getTime() - new Date(b2.created).getTime()
        );
        expect(data[0].registered).toBe(10);
        expect(data[0].activated).toBe(0);
        expect(data[1].registered).toBe(5);
        expect(data[1].activated).toBe(0);
    });
    it('Get batch of devices pagination test', async () => {
        const response = await DeviceApi.createBatch(authToken, product.id, 20);
        expect(response.status).toBe(200);
        const { data } = response;
        expect(data.id).toBeDefined();
        let getResponse = await DeviceApi.getBatchDevices(authToken, data.id, { from: 0, to: 10 });
        expect(getResponse.status).toBe(200);
        let { data: getData } = getResponse;
        expect(getData?.devices).toHaveLength(10);
        expect(getData?.total).toBe(20);
        getResponse = await DeviceApi.getBatchDevices(authToken, data.id, { from: 15, to: 20 });
        expect(getResponse.status).toBe(200);
        ({ data: getData } = getResponse);
        expect(getData?.devices).toHaveLength(5);
        expect(getData?.total).toBe(20);
    });
    it('Create batch for non existence product', async () => {
        const response = await DeviceApi.createBatch(authToken, 'nonexistenceId', 20);
        expect(response.status).toBe(409);
    });

    it('Create batch with WIFI type', async () => {
        const response = await DeviceApi.createBatch(authToken, product.id, 1, BatchType.WIFI);
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
        expect(response.data.type).toBe(BatchType.WIFI);
    });

    it('Create batch with description', async () => {
        const description = 'test description';
        const response = await DeviceApi.createBatch(
            authToken,
            product.id,
            1,
            BatchType.WIFI,
            { description }
        );
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
        expect(response.data.description).toBe(description);
    });

    it('Get batch devices for non existence batch id', async () => {
        const response = await DeviceApi.getBatchDevices(authToken, 'nonexistenceId');
        expect(response.status).toBe(409);
    });

    it('Get batches for non existence product test', async () => {
        const getBatchesResponse = await DeviceApi.getAllBatches(authToken, 'nonexistenceId');
        expect(getBatchesResponse.status).toBe(200);
        expect(getBatchesResponse.data).toHaveLength(0);
    });

    it('Download batch test', async () => {
        const response = await DeviceApi.createBatch(authToken, product.id, 10);
        expect(response.status).toBe(200);
        const { data } = response;
        expect(data.id).toBeDefined();
        const downloadResponse = await DeviceApi.downloadBatch(authToken, data.id);
        expect(downloadResponse.status).toBe(200);
        expect(downloadResponse.data).toBeDefined();
        const csvBodyArray = downloadResponse.data.replace(/\n/g, ',').split(',');
        expect(csvBodyArray).toHaveLength(22);
        expect(csvBodyArray[0]).toBe(`"Serial Number"`);
        expect(csvBodyArray[1]).toBe(`"Mac Address"`);
    });

    it('Download non existence batch test', async () => {
        const downloadResponse = await DeviceApi.downloadBatch(authToken, 'nonexistenceId');
        expect(downloadResponse.status).toBe(409);
    });

    it('Device activation test', async () => {
        const response = await DeviceApi.createBatch(authToken, product.id, 2);
        expect(response.status).toBe(200);
        const { data } = response;
        const getResponse = await DeviceApi.getBatchDevices(authToken, data.id);
        expect(getResponse.status).toBe(200);
        const { data: getData } = getResponse;
        expect(getData?.devices).toHaveLength(2);
        expect(getData?.total).toBe(2);
        const { devices } = getData;
        let getBatchesResponse = await DeviceApi.getAllBatches(authToken, product.id);
        expect(getBatchesResponse.status).toBe(200);
        let { data: batches } = getBatchesResponse;
        expect(batches).toHaveLength(1);
        const [ batchInfo ] = batches;
        expect(batchInfo.activated).toBe(0);
        for (const device of devices) {
            const response = await DeviceApi.activate(randomString(), device.sn);
            expect(response.status).toBe(200);
        }
        getBatchesResponse = await DeviceApi.getAllBatches(authToken, product.id);
        ({ data: batches } = getBatchesResponse);
        expect(batches[0].activated).toBe(2);
    });

    it('Activate already activated device test', async () => {
        const response = await DeviceApi.createBatch(authToken, product.id, 1);
        expect(response.status).toBe(200);
        const { data } = response;
        const getResponse = await DeviceApi.getBatchDevices(authToken, data.id);
        expect(getResponse.status).toBe(200);
        const { data: getData } = getResponse;
        const { devices: [ device ] } = getData;
        let activateResponse = await DeviceApi.activate(randomString(), device.sn);
        expect(activateResponse.status).toBe(200);
        activateResponse = await DeviceApi.activate(randomString(), device.sn);
        expect(activateResponse.status).toBe(409);
    });
    it('Activate non existence device', async () => {
        const activateResponse = await DeviceApi.activate(randomString(), 'nonexistenceId');
        expect(activateResponse.status).toBe(409);
    });
    it('Check mac sequence', async () => {
        const response = await DeviceApi.createBatch(authToken, product.id, 10);
        expect(response.status).toBe(200);
        let checkResponse = await DeviceApi.checkMacSequence(
            authToken,
            '00:06:8b:01:00:10',
            10
        );
        expect(checkResponse.status).toBe(200);
        checkResponse = await DeviceApi.checkMacSequence(
            authToken,
            '00:06:8b:01:00:02',
            2
        );
        expect(checkResponse.status).toBe(409);
        checkResponse = await DeviceApi.checkMacSequence(
            authToken,
            '00:06:8b:01:00:0a',
            2
        );
        expect(checkResponse.status).toBe(409);
    });
    it('Create BLE batch', async () => {
        const response = await DeviceApi.createBatch(
            authToken,
            product.id,
            10,
            BatchType.BLE,
            { firstMac: '00:06:8b:01:00:0a' }
        );
        expect(response.status).toBe(200);
        const { data } = response;
        expect(data.type).toBeDefined();
        expect(data.type).toBe(BatchType.BLE);
        const devicesResponse = await DeviceApi.getBatchDevices(authToken, data.id);
        expect(devicesResponse.status).toBe(200);
        const { data: { devices } } = devicesResponse;
        expect(devices).toHaveLength(10);
        devices.sort(
            (d1: IDevice, d2: IDevice) => d1.mac.localeCompare(d2.mac)
        );
        expect(devices[0].mac).toBe('00:06:8b:01:00:0a');
        expect(devices[1].mac).toBe('00:06:8b:01:00:0b');
    });

    it('Create BLE batch without first mac', async () => {
        const response = await DeviceApi.createBatch(
            authToken,
            product.id,
            10,
            BatchType.BLE
        );
        expect(response.status).toBe(400);
    });

    it('Create BLE batch with existence first mac', async () => {
        const wifiResponse = await DeviceApi.createBatch(
            authToken,
            product.id,
            10
        );
        expect(wifiResponse.status).toBe(200);

        const bleResponse = await DeviceApi.createBatch(
            authToken,
            product.id,
            10,
            BatchType.BLE,
            { firstMac: '00:06:8b:01:00:01' }
        );
        expect(bleResponse.status).toBe(409);
    });

});