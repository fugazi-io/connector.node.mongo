/**
 * Created by nitzan on 20/02/2017.
 */

import * as connector from "@fugazi/connector";
import * as shared from "./shared";

const pathFor = connector.utils.path.getter(__dirname, "../../");
const COMMANDS = [] as Array<(module: connector.components.ModuleBuilder) => void>;

export function init(parentModule: connector.components.ModuleBuilder): void {
	const module = parentModule.module("databases")
		.type({
			"name": "dbs",
			"title": "List of dbs",
			"type": "list<db>"
		})
		.commands(pathFor("client-scripts/bin/database.commands.js"));

	COMMANDS.forEach(fn => fn(module));
}

type MongoListDatabasesResult = {
	ok: number;
	totalSize: number;
	databases: Array<{ name: string; sizeOnDisk: number; empty: boolean; }>;
}

function list(request: connector.server.Request): Promise<shared.Db[]> {
	return shared.admin().then(admin => {
		return (admin.listDatabases() as Promise<MongoListDatabasesResult>).then(obj => {
			return obj.databases.map(db => ({ name: db.name }));
		});
	});
}
COMMANDS.push((module: connector.components.ModuleBuilder) => {
	module
		.command("list", {
			title: "returns all of the databases in this mongo",
			returns: "dbs",
			syntax: "list dbs"
		})
		.endpoint("dbs")
		.handler(shared.createHandler(list));
});

function createDb(request: connector.server.Request): Promise<shared.Db> {
	return shared.db(request.data("dbname")).then(db => {
		return { name: db.databaseName };
	});
}
COMMANDS.push((module: connector.components.ModuleBuilder) => {
	module
		.command("create", {
			title: "creates a new db",
			returns: "db",
			syntax: "create db (dbname string)"
		})
		.endpoint("dbs/create/{ dbname }")
		.handler(shared.createHandler(createDb));
});

function dropDb(request: connector.server.Request): Promise<string> {
	return shared.db(request.data("dbname")).then(db => {
		const name = db.databaseName;

		return db.dropDatabase()
			.then(() => "The db '" + name + "' was dropped");
	});
}
COMMANDS.push((module: connector.components.ModuleBuilder) => {
	module
		.command("drop", {
			title: "drops a db",
			returns: "ui.message",
			syntax: [
				"drop db",
				"drop db (dbname string)"
			]
		})
		.endpoint("dbs/drop/{ dbname }")
		.handler(shared.createHandler(dropDb));
});
