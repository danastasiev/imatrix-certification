import {Container} from "typedi";
import {DeviceUtils} from "./device.utils";
import {IDevice} from "../../device/types/device.model";
import {DeviceApi} from "./device-api";
import {OTHER_MANUFACTURER_ID} from "../../certs/certs.constants";

const deviceUtils = Container.get(DeviceUtils);

const testCsr = `-----BEGIN CERTIFICATE REQUEST-----
MIIBRzCB6wIBADCBiDELMAkGA1UEBhMCVVMxDzANBgNVBAgMBk5ldmFkYTEUMBIG
A1UEBwwLWmVwaHlyIENvdmUxGDAWBgNVBAoMD2lNYXRyaXggU3lzdGVtczEUMBIG
A1UECwwLSW9UIERldmljZXMxIjAgBgNVBAMMGTgwMzUxMzQyNDIuaW1hdHJpeHN5
cy5jb20wWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAQzDctVeSErj2qIzc3CU6Wu
x03/9Wl2nD99wq+XZqJNyMqV9Mkryk8NbKTYORzsCUQvt+hFP1pEFbsOjFgIhT/C
oAAwDAYIKoZIzj0EAwIFAANJADBGAiEA06EjeARlbhQMo9CR5t9gLPBRShpql80C
ZsIpWaB9LJACIQCxG/22J7SVOQZlKUbgRnYilnPFOc/uYsrL7UWXMF67hQ==
-----END CERTIFICATE REQUEST-----`;

describe('Sign client certs for new devices', () => {
    let device: IDevice;

    beforeEach(async () => {
        device = deviceUtils.generateDevice();
        await deviceUtils.createDevice(device);
    });

    afterEach(async () => {
        await deviceUtils.clearDevices();
    });

    it("Sign new device", async () => {
        const nonExistenceDevice =  deviceUtils.generateDevice();
        const failedResp = await DeviceApi.signCert(nonExistenceDevice, testCsr);
        expect(failedResp.status).toBe(404);
        const failedRespData = failedResp.data;
        expect(failedRespData.message).toBeDefined();
        expect(failedRespData.message).toContain('Device does not exist');
        const successResp = await DeviceApi.signCert(device, testCsr);
        expect(successResp.status).toBe(200);
        expect(successResp.data).toBeDefined();
    });

    it("Sign with invalid manufacturer id", async () => {
        const successResp = await DeviceApi.signCert(device, testCsr, '1234567890');
        expect(successResp.status).toBe(400);
    });

    it("Different certs should be generated for different manufacturers", async () => {
        const imatrixResp = await DeviceApi.signCert(device, testCsr);
        expect(imatrixResp.status).toBe(200);
        expect(imatrixResp.data).toBeDefined();
        const otherResp = await DeviceApi.signCert(device, testCsr, OTHER_MANUFACTURER_ID);
        expect(otherResp.status).toBe(200);
        expect(otherResp.data).toBeDefined();
        expect(imatrixResp.data).not.toBe(otherResp.data);
    });

    it("Sign for non existence device and other manufacturer", async () => {
        const nonExistenceDevice =  deviceUtils.generateDevice();
        const otherResp = await DeviceApi.signCert(nonExistenceDevice, testCsr, OTHER_MANUFACTURER_ID);
        expect(otherResp.status).toBe(200);
        expect(otherResp.data).toBeDefined();
    });
});