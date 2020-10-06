import {Container} from "typedi";
import {DeviceUtils} from "./device.utils";
import {AuthUtils} from "../auth/auth-utils";
import {IDevice} from "../../device/types/device.model";
import {DeviceApi} from "./device-api";

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


const deviceUtils = Container.get(DeviceUtils);
const authUtils = Container.get(AuthUtils);
const TIME_DIFFERENCE = 100000;
let authToken: string;
let device: IDevice;

describe('Getting cert logs test', () => {
    afterEach(async () => {
        await authUtils.clearUsers();
        await deviceUtils.clearDevices();
        await deviceUtils.clearLogs();
    });
    afterAll(async () => {
        await authUtils.clearUsers();
    });
    beforeAll(async() => {
        const { token } = await authUtils.createAndLoginUser('logsUser');
        authToken = token;
    });
    beforeEach(async () => {
        device = deviceUtils.generateDevice();
        await deviceUtils.createDevice(device);
        let successResp = await DeviceApi.signCert(device, testCsr);
        expect(successResp.status).toBe(200);
        successResp = await DeviceApi.signCert(device, testCsr);
        expect(successResp.status).toBe(200);
    });

    it('Getting logs by serial number test', async () => {
        const resp = await DeviceApi.getLogsBySerialNumber(authToken, device.sn);
        expect(resp.status).toBe(200);
        expect(resp.data).toHaveLength(2);
    });

    it('Getting logs by time period test', async () => {
        const from = new Date().getTime();
        const to = from + TIME_DIFFERENCE;
        const resp = await DeviceApi.getLogsByTimePeriod(authToken, from, to);
        expect(resp.status).toBe(200);
        expect(resp.data).toHaveLength(2);
    });

    it('Endpoints for getting logs are secured', async () => {
        let resp = await DeviceApi.getLogsBySerialNumber("", device.sn);
        expect(resp.status).toBe(401);
        const from = new Date().getTime();
        const to = from + 1000;
        resp = await DeviceApi.getLogsByTimePeriod("", from, to);
        expect(resp.status).toBe(401);
    });

    it('TO parameter must be bigger than FROM', async () => {
        const from = new Date().getTime();
        const to = from + TIME_DIFFERENCE;
        const resp = await DeviceApi.getLogsByTimePeriod(authToken, to, from);
        expect(resp.status).toBe(400);
    });

    it('Getting logs by nonexistence serial number', async () => {
        const newDevice = deviceUtils.generateDevice();
        const resp = await DeviceApi.getLogsBySerialNumber(authToken, newDevice.sn);
        expect(resp.status).toBe(200);
        expect(resp.data).toHaveLength(0);
    });

    it('Getting logs by time period for different devices', async () => {
        const newDevice = deviceUtils.generateDevice();
        await deviceUtils.createDevice(newDevice);
        const successResp = await DeviceApi.signCert(newDevice, testCsr);
        expect(successResp.status).toBe(200);
        const from = new Date().getTime();
        const to = from + TIME_DIFFERENCE;
        const resp = await DeviceApi.getLogsByTimePeriod(authToken, from, to);
        expect(resp.status).toBe(200);
        expect(resp.data).toHaveLength(3);
    });
});