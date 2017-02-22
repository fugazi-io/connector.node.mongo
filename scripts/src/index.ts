/**
 * Created by nitzan on 16/02/2017.
 */

import * as mongo from "mongodb";
import * as connector from "fugazi.connector.node";

import program =  require("commander");

import { MongoFacade } from "./shared";

const VERSION = "1.0.0",
	DEFAULT_PORT = 27017,
	DEFAULT_HOST = "localhost";

let port: number,
	host: string;

type FacadeImpl = MongoFacade & {
	_admin: mongo.Admin;
	_dbs: Map<string, mongo.Db>
	loadDb(this: FacadeImpl, name?: string): Promise<mongo.Db>;
	setDb(this: FacadeImpl, name: string, db: mongo.Db): void;
};
const FACADE: FacadeImpl = {
	_admin: null as any,
	_dbs: new Map<string, mongo.Db>(),

	db: function(this: FacadeImpl, name: string) {
		if (!this._dbs.has(name)) {
			return this.loadDb(name);
		}
		return Promise.resolve(this._dbs.get(name));
	},
	admin: function(this: FacadeImpl) {
		if (!this._admin) {
			return this.loadDb().then(db => db.admin());;
		}

		return Promise.resolve(this._admin);
	},

	setDb(this: FacadeImpl, name: string, db: mongo.Db) {
		this._dbs.set(name, db);

		if (!this._admin) {
			this._admin = db.admin();
		}
	},
	loadDb(this: FacadeImpl, name?: string) {
		const url = establishMongoUrl(name);

		return mongo.MongoClient.connect(url).then(db => {
			CONNECTOR.logger.info(`connected to mongo at ${ url }`);

			this._dbs.set(db.databaseName, db);
			return db;
		});
	}
};

import { init as databases } from "./databases";
import { init as collections } from "./collections";

declare module "commander" {
	interface ICommand {
		host?: string;
		port?: number | string;
		database?: string;
	}
}

let CONNECTOR: connector.Connector;
(() => {
	program.version(VERSION)
		.option("-h, --host [host]", "Host")
		.option("-p, --port [port]", "Port")
		.parse(process.argv);

	host = program.host || DEFAULT_HOST;
	port = Number(program.port) || DEFAULT_PORT;

	const builder = new connector.Builder();
	const module = {
		name: "mongo",
		title: "MongoDB connector",
		modules: {}
	} as connector.RootModule;

	(module.modules as connector.ComponentMap<connector.Module>)["database"] = databases(builder, FACADE);
	(module.modules as connector.ComponentMap<connector.Module>)["collections"] = collections(builder, FACADE);

	builder.module("/descriptor.json", module, true);
	CONNECTOR = builder.build();
	CONNECTOR.start();
})();


function establishMongoUrl(dbName?: string): string {
	const url = `mongodb://${ host }:${ port }`;

	if (dbName && dbName.trim().length > 0) {
		return url + "/" + dbName;
	}

	return url;
}