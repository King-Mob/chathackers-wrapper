import { DuckDBConnection, DuckDBInstance } from "@duckdb/node-api";

let connection: DuckDBConnection;

export async function startDuckDB() {
    const chatHackersDuckDBFileName = "chathackers_duckdb.db";

    const instance = await DuckDBInstance.create(chatHackersDuckDBFileName);
    connection = await instance.connect();

    const tables = [
        {
            name: "ModuleActivations",
            creationCommand:
                "CREATE TABLE ModuleActivations (module_id VARCHAR, room_id VARCHAR, active BOOLEAN, created_by_user_id VARCHAR);",
        }
    ]

    const existingTablesRows = await connection.run("SHOW TABLES;");
    const existingTables = await existingTablesRows.getRowObjects();

    tables.forEach(async (table) => {
        const tableExists = existingTables.filter((existingTable) => existingTable.name === table.name).length > 0;

        if (tableExists) {
            console.log(`${table.name} already exists`);
        } else {
            await connection.run(table.creationCommand);
            console.log(`${table.name} created`);
        }
    });
}

export async function getActiveModulesForRoomId(roomId: string) {
    const getActiveModules = `SELECT * FROM ModuleActivations WHERE room_id='${roomId}' AND active=true;`;
    const activeModuleRows = await connection.run(getActiveModules);
    const activeModules = await activeModuleRows.getRowObjects();
    return activeModules;
}

// insert a new active module, (moduleId, roomId, userId)

// update module activation (moduleId, roomId, active)