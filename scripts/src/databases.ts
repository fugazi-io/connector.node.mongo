/**
 * Created by nitzan on 20/02/2017.
 */

import * as connector from "@fugazi/connector";
import * as shared from "./shared";

const pathFor = connector.utils.path.getter(__dirname, "../../");

export function init(module: connector.components.ModuleBuilder): void {
	module
		.module("databases")
		.type({
			"name": "dbs",
			"title": "List of dbs",
			"type": "list<db>"
		})
		.command("list", {
				title: "returns all of the databases in this mongo",
				returns: "dbs",
				syntax: "list dbs"
			})
			.endpoint("dbs")
			.handler(list)
			.parent()
		.command("create", {
				title: "creates a new db",
				returns: "db",
				syntax: "create db (dbname string)"
			})
			.endpoint("dbs/create/{ dbname }")
			.handler(createDb)
			.parent()
		.command("drop", {
				title: "drops a db",
				returns: "ui.message",
				syntax: [
					"drop db",
					"drop db (dbname string)"
				]
			})
			.endpoint("dbs/drop/{ dbname }")
			.handler(dropDb)
			.parent()
		.commands(pathFor("client-scripts/bin/database.commands.js"));
}

type MongoListDatabasesResult = {
	ok: number;
	totalSize: number;
	databases: Array<{ name: string; sizeOnDisk: number; empty: boolean; }>;
}

function list(request: connector.server.Request): Promise<connector.server.Response> {
	return shared.wrapCommandResult(shared.admin().then(admin => {
		return (admin.listDatabases() as Promise<MongoListDatabasesResult>).then(obj => {
			return obj.databases.map(db => ({ name: db.name }));
		});
	}));
}

function createDb(request: connector.server.Request): Promise<connector.server.Response> {
	return shared.wrapCommandResult(shared.db(request.data("dbname")).then(db => {
		return { name: db.databaseName };
	}));
}

function dropDb(request: connector.server.Request): Promise<connector.server.Response> {
	return shared.wrapCommandResult(shared.db(request.data("dbname")).then(db => {
		const name = db.databaseName;

		return db.dropDatabase()
			.then(() => "The db '" + name + "' was dropped");
	}));
}
