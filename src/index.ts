import {AppHolder} from "./app";
import * as path from "path";
import * as https from 'https';
import * as fs from "fs";
import {PORT} from "./constants";

(async () => {
    try {
        const appHolder = new AppHolder();
        await appHolder.init();
        const certPath = path.resolve(__dirname, '../certs/server.crt');
        const keyPath = path.resolve(__dirname, '../certs/server.key');
        const server = https.createServer(
            {
                cert: fs.readFileSync(certPath, 'utf8'),
                key: fs.readFileSync(keyPath, 'utf8')
            },
            appHolder.app
        );
        server.listen(PORT);
        server.on('error', (error: any) => {
            console.log(`Start server error: ${error}`);
            process.exit(1);
        });
        server.on('listening', () => {
            console.log( `server started at https://localhost/` );
        });
    } catch (e) {
        console.log(`Unexpected error: ${e}`);
        process.exit(1);
    }
})();


