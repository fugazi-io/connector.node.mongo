/**
 * Created by nitzan on 20/02/2017.
 */

import * as mongo from "mongodb";
import { LoggerInstance } from "winston";
import * as connector from "@fugazi/connector";

let _admin: mongo.Admin,
	_dbs = new Map<string, mongo.Db>();

let _logger: LoggerInstance,
	_mongoPort: number,
	_mongoHost: string;

/*export type MongoFacade = {
	db(name: string): Promise<mongo.Db>;
	admin(): Promise<mongo.Admin>;
}*/

export function init(logger: LoggerInstance, mongoHost: string, mongoPort: number) {
	_logger = logger;
	_mongoHost = mongoHost;
	_mongoPort = mongoPort;
}

export function db(name: string): Promise<mongo.Db> {
	if (!_dbs.has(name)) {
		return loadDb(name);
	}
	return Promise.resolve(_dbs.get(name)!);
}

export function admin(): Promise<mongo.Admin> {
	if (!_admin) {
		return loadDb().then(db => db.admin());;
	}

	return Promise.resolve(_admin);
}

export function setDb(name: string, db: mongo.Db) {
	_dbs.set(name, db);

	if (!_admin) {
		_admin = db.admin();
	}
}

export function wrapCommandResult(resultPromise: Promise<any>): Promise<connector.server.Response> {
	return resultPromise.then(result => {
		return {
			data: result,
			status: connector.server.ResponseStatus.Success
		};
	}).catch(error => {
		return {
			data: getErrorMessage(error),
			status: connector.server.ResponseStatus.Failure
		}
	});
}

function loadDb(name?: string) {
	const url = establishMongoUrl(name);

	return mongo.MongoClient.connect(url).then(db => {
		_logger.info(`connected to mongo at ${ url }`);

		_dbs.set(db.databaseName, db);
		return db;
	});
}

function establishMongoUrl(dbName?: string): string {
	const url = `mongodb://${ _mongoHost }:${ _mongoPort }`;

	if (dbName && dbName.trim().length > 0) {
		return url + "/" + dbName;
	}

	return url;
}

function getErrorMessage(error: any): string {
	if (!error) {
		return "unknown error";
	}

	if (typeof error === "string") {
		return error;
	}

	if (error instanceof Error) {
		return error.message;
	}

	return error.toString();
}