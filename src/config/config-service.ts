import {Service} from "typedi";
import * as path from 'path';
import * as fs from 'fs';
import {SystemSettings} from './system-settings.model';

@Service()
export class ConfigService {
    private readonly CONFIG_NAME = 'system-config.json';
    private systemSettings: SystemSettings;
    constructor() {
        const configPath = path.resolve(__dirname, `../../${this.CONFIG_NAME}`);
        if (!fs.existsSync(configPath)) {
            throw new Error(
                `Config does not exist: ${configPath}`
            );
        }
        const settingsString = fs.readFileSync(configPath, {
            encoding: 'utf8'
        });
        this.systemSettings = JSON.parse(settingsString);
    }
    public getDbHost (): string {
        return this.systemSettings.db.host;
    }
    public getDbUser (): string {
        return this.systemSettings.db.user;
    }
    public getDbPassword (): string {
        return this.systemSettings.db.password;
    }
}