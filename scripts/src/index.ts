/**
 * Created by nitzan on 16/02/2017.
 */

import * as mongo from "mongodb";
import * as connector from "@fugazi/connector";

import { init as databases } from "./databases";
import { init as collections } from "./collections";

import program = require("commander");

import * as shared from "./shared";
const pjson = require("../../package.json");

const VERSION = pjson.version as string,
	DEFAULT_HOST = "localhost",
	DEFAULT_MONGO_PORT = 27017,
	DEFAULT_LISTEN_PORT = 33333;

let CONNECTOR: connector.Connector;

declare module "commander" {
	interface ICommand {
		db?: string;
		mongoHost?: string;
		mongoPort?: number | string;
		listenHost?: string;
		listenPort?: number | string;
	}
}

function addTypes(module: connector.components.ModuleBuilder): void {
	module
		.lookup("dbname", "module:default.db")
		.type({
			"name": "db",
			"title": "Database",
			"type": {
				"name": "string"
			}
		})
		.type({
			"name": "collection",
			"title": "Collection",
			"type": {
				"name": "string"
			}
		});
}

(() => {
	program.version(VERSION)
		.option("--db [db-name]", "The database to connect to")
		.option("--mongo-host [host]", "Host on which MongoDB is listening")
		.option("--mongo-port [port]", "Port on which MongoDB is listening")
		.option("--listen-host [host]", "Host on which the service will listen on")
		.option("--listen-port [port]", "Port on which the service will listen on")
		.parse(process.argv);

	const db = program.db || null;
	const listenHost = program.listenHost || DEFAULT_HOST;
	const listenPort = Number(program.listenPort) || DEFAULT_LISTEN_PORT;

	const mongoHost = program.mongoHost || DEFAULT_HOST;
	const mongoPort = Number(program.mongoPort) || DEFAULT_MONGO_PORT;

	const builder = new connector.ConnectorBuilder();
	builder.server().host(listenHost).port(listenPort);
	const module = builder.module({
		name: "mongo",
		title: "MongoDB connector"
	});

	addTypes(module);

	databases(module);
	collections(module);

	let whenToStartServer: Promise<any>;
	if (db) {
		whenToStartServer = shared.db(db);
	} else {
		whenToStartServer = Promise.resolve();
	}

	whenToStartServer.then(() => {
		CONNECTOR = builder.build();
		shared.init(CONNECTOR.logger, mongoHost, mongoPort);
		CONNECTOR.logger.info(`Connected to mongo at ${ mongoHost }:${ mongoPort }`);
		CONNECTOR.start().then(() => CONNECTOR.logger.info("connector started"));
	}).catch((e: any) => {
		if (e instanceof Error) {
			console.error("failed to start mongo, message: " + e.message);
		} else {
			console.error("failed to start mongo, error: ", e);
		}
	});
})();
