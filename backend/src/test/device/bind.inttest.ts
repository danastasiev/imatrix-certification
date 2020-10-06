import {Container} from "typedi";
import {DeviceUtils} from "./device.utils";
import {DeviceApi} from "./device-api";
import {randomString} from "../random-utils";

jest.setTimeout(10000);
const deviceUtils = Container.get(DeviceUtils);

describe('Test bind operation', () => {
    afterEach(async () => {
        await deviceUtils.clearDevices();
    });

    it('Check same response for same request', async () => {
        const cpuId = randomString();
        const productId = randomString();
        let bindResponse = await DeviceApi.bind(cpuId, productId);
        expect(bindResponse.status).toBe(200);
        const { mac, sn, pw } = bindResponse.data;
        expect(mac).toBeDefined();
        expect(pw).toBeDefined();
        expect(sn).toBeDefined();
        bindResponse = await DeviceApi.bind(cpuId, productId);
        expect(bindResponse.status).toBe(200);
        expect(bindResponse.data).toBeDefined();
        expect(sn).toBe(bindResponse.data.sn);
        expect(mac).toBe(bindResponse.data.mac);
        expect(pw).toBe(bindResponse.data.pw);
    });

    it('Check response for different cpuId and productId', async () => {
        const cpuId = randomString();
        const productId = randomString();
        let bindResponse = await DeviceApi.bind(cpuId, productId);
        expect(bindResponse.status).toBe(200);
        const { mac, sn, pw } = bindResponse.data;
        expect(mac).toBeDefined();
        expect(pw).toBeDefined();
        expect(sn).toBeDefined();
        const otherCpuId = randomString();
        const otherProductId = randomString();
        bindResponse = await DeviceApi.bind(otherCpuId, otherProductId);
        expect(bindResponse.status).toBe(200);
        expect(bindResponse.data).toBeDefined();
        expect(sn).not.toBe(bindResponse.data.sn);
        expect(mac).not.toBe(bindResponse.data.mac);
        expect(pw).not.toBe(bindResponse.data.pw);
    });
});