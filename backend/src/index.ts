import {AppHolder} from "./app";
import {PORT, INTERNAL_PORT} from "./constants";
import {Container} from "typedi";
import {DBProvider} from "./db/db-provider";
import {BIND_DB_NAME, BIND_DB_NAME_TEST, IMATRIX_DB_NAME, IMATRIX_DB_NAME_TEST} from "./db/constants";
import {CertsRouter} from "./certs/certs.router";
import {AuthRouter} from "./auth/auth.router";
import {InternalRouter} from "./internal/internal.router";
import {DeviceRouter} from "./device/device.router";
import {ProductRouter} from "./product/product.router";

const setupTestEnvironment = async (): Promise<void> => {
    await Container.get(DBProvider).runInitialTestSchemaMigration();
    Container.set('bind-db-name', BIND_DB_NAME_TEST);
    Container.set('imatrix-db-name', IMATRIX_DB_NAME_TEST);
    console.log('TEST environment setup process completed');
};

const setupDevelopmentEnvironment = async(): Promise<void> => {
    await Container.get(DBProvider).runInitialDevelopmentSchemaMigration();
    Container.set('bind-db-name', BIND_DB_NAME);
    Container.set('imatrix-db-name', IMATRIX_DB_NAME);
    console.log('DEVELOPMENT environment setup process completed');
};

(async () => {
    try {
        await Container.get(DBProvider).checkDbConnection();
        if (process.env.IMATRIX_ENVIRONMENT === 'TEST') {
            await setupTestEnvironment();
        } else {
            await setupDevelopmentEnvironment();
        }
        const mainApp = new AppHolder(PORT, [
            CertsRouter,
            AuthRouter,
            DeviceRouter,
            ProductRouter
        ], true);
        const internalApp = new AppHolder(INTERNAL_PORT, [InternalRouter]);
        mainApp.start();
        internalApp.start();

    } catch (e) {
        console.log(`Unexpected error: ${e}`);
        process.exit(1);
    }
})();


