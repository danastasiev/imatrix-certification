import {Container} from "typedi";
import {DeviceUtils} from "./device.utils";
import {IDevice} from "../../device/types/device.model";
import {DeviceApi} from "./device-api";
import {OTHER_MANUFACTURER_ID} from "../../certs/certs.constants";

const deviceUtils = Container.get(DeviceUtils);

const testCsr = `-----BEGIN CERTIFICATE REQUEST-----
MIIC8zCCAdsCAQAwgZQxCzAJBgNVBAYTAlVTMQ8wDQYDVQQIDAZOZXZhZGExFDAS
BgNVBAcMC1plcGh5ciBDb3ZlMRAwDgYDVQQKDAdpTWF0cnl4MQ0wCwYDVQQLDARk
ZXZzMRkwFwYDVQQDDBAqLmltYXRyeXhzeXMuY29tMSIwIAYJKoZIhvcNAQkBFhN0
ZXN0QGltYXRyeXhzeXMuY29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKC
AQEAvVvJEZz0LqgYdw6FVryUyXZwLCtAng8Wf4QmKGTfrOnXwdVgJc2XZigEMBB2
ruwr7mRHy5Su5tTe3ohXYXemjFlRzF1okRkpvC93aMYzUDxWPhrdhe10mH5xtEBK
+A65dx10C749DSaPi2vvKXNYSVFeuu3yCtAHGWzHlSlQG9qL9Iyyma+lWOO0Yl24
c5ypBEDFgEPEPWylDgRVXXraGg+5C7HlRdVgolgJpkOyRSoejN/0MU3qEARkr4AT
JC/78f7pv5/SnUtUTWnEnKd77/aukyWX92CHxpgGwo0OWdDjoU/KYFk+yGiWO2Iw
AhZ2eeZMKE0Df6pAYgJnIP9oDQIDAQABoBkwFwYJKoZIhvcNAQkHMQoMCHBhc3N3
b3JkMA0GCSqGSIb3DQEBCwUAA4IBAQAYw5wghAeUAi1TQHHNG1QIH5pbINN2kpgp
nY/Ba6qMLCrQiLs70JJO6DK8o+sZh4bKfQ73IdCgLw/DVoLuGnToQNjLIiHyxsKe
6WPwOylvSBdvW/vIGIpyqEqAgMyC8egd9TZUaeqgpGX/HkDa3AeLEaGDUzrTPF07
LCHO2k/k8VcYdGwuyeY9vaQebZfa6PRHhyIQSNX8pF+e9D8ky7ECN4Z0scmoZEiS
goZ85goHL5iwMQm9Zcj3Gawaq/p60rAOVU1MAIhyAQTKl6mkto3yVnVap4vjgZZT
R6iQHd0zfQf1nNK6dTLQfz/q4FA/3MveRqRu4Savqalxz7oRdg0M
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