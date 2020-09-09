import * as Knex from 'knex';
import * as fs from 'fs';
import * as path from 'path';
import {Container, Inject, Service} from "typedi";
import {ConfigService} from "../config";
import {BIND_DB_NAME} from "./constance";


@Service()
export class DBProvider {
    private host: string;
    private user: string;
    private password: string;

    private testMigrationsFolder: string;

    constructor(
        private readonly configService: ConfigService
    ) {
        this.configService = Container.get(ConfigService);
        this.host = this.configService.getDbHost();
        this.user = this.configService.getDbUser();
        this.password = this.configService.getDbPassword();
        this.testMigrationsFolder = path.resolve(__dirname, './test-migrations');
    }

    public async createDbConnection(dbName: string): Promise<Knex> {
        return Knex({
            client: 'mysql',
            connection: {
                host: this.host,
                user: this.user,
                password: this.password,
                database: dbName,
                multipleStatements: true
            },
            pool: { min: 0, max: 7 }
        });
    }

    public async checkDbConnection(): Promise<void> {
        const knex = await this.createDbConnection(BIND_DB_NAME);
        await knex.raw('select * from device');
    }

    // private async tablesAlreadyInitialized(
    //     trxFinal: Knex
    // ): Promise<boolean> {
    //     const rawQuery = `SELECT EXISTS (
    //   SELECT 1 as inited
    //   FROM   pg_catalog.pg_tables
    //   WHERE  schemaname = 'sirin'
    //   AND    tablename = 'users'
    //   )`;
    //     return (await trxFinal.raw(rawQuery)).rows[0].exists;
    // }
    //
    public async runInitialTestSchemaMigration(): Promise<void> {
        const knex = await this.createDbConnection(BIND_DB_NAME);
        const schemaFiles: string[] = fs
            .readdirSync(this.testMigrationsFolder)
            .filter(filename => filename.includes('.sql'));
        for (const filename of schemaFiles) {
            const filePath = path.join(this.testMigrationsFolder, filename);
            const fileContents = fs.readFileSync(filePath);
            await knex.raw(fileContents.toString());
        }
    }
    //
    // public async createInitialSchema(): Promise<void> {
    //     const trxFinal = await this.createDbConnection();
    //     try {
    //         const tablesAlreadyInitialized = await this.tablesAlreadyInitialized(trxFinal);
    //         if (!tablesAlreadyInitialized) {
    //             await this.runInitialSchemaMigration(trxFinal);
    //         }
    //     } catch (err) {
    //         throw new Error(
    //             `Failed to create initial schema with error: ${err}`,
    //         );
    //     }
    // }
}