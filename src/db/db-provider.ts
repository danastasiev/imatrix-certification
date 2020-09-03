import * as Knex from 'knex';
import {Service} from "typedi";
import {ConfigService} from "../config";
import {BIND_DB_NAME} from "./constance";


@Service()
export class DBProvider {
    private host: string;
    private user: string;
    private password: string;
    constructor(
        private readonly configService: ConfigService
    ) {
        this.host = configService.getDbHost();
        this.user = configService.getDbUser();
        this.password = configService.getDbPassword();
    }

    public async createDbConnection(dbName = BIND_DB_NAME): Promise<Knex> {
        return Knex({
            client: 'mysql',
            connection: {
                host: this.host,
                user: this.user,
                password: this.password,
                database: dbName
            },
            pool: { min: 0, max: 7 }
        });
    }

    public async checkDbConnection(): Promise<void> {
        const knex = await this.createDbConnection();
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
    // private async runInitialSchemaMigration(
    //     trxFinal: Knex | Knex.Transaction
    // ): Promise<void> {
    //     const schemaFiles: string[] = fs
    //         .readdirSync(this.migrationsFolder)
    //         .filter(filename => filename.includes('.sql'));
    //     for (const filename of schemaFiles) {
    //         const filePath = path.join(this.migrationsFolder, filename);
    //         const fileContents = fs.readFileSync(filePath);
    //         await trxFinal.raw(fileContents.toString());
    //     }
    // }
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