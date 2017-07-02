/**
 * Created by nitzan on 21/02/2017.
 */

import * as shared from "./shared";
import * as connector from "@fugazi/connector";

export function init(module: connector.components.ModuleBuilder): void {
	module
		.module("collections")
			.type({
				"name": "collections",
				"type": "list<collection>"
			})
			.command("list", {
				title: "returns all of the collections in a db",
				returns: "collections",
				syntax: [
					"list collections",
					"list collections in (dbname string)"
				]
			})
			.endpoint("{ dbname }/collections")
			.handler(list);
}

type MongoListCollectionsResult = Array<{ name: string; options: any; }>;
function list(request: connector.server.Request): Promise<connector.server.Response> {
	return shared.wrapCommandResult(shared.db(request.data("db")).then(db => {
		return (db.listCollections({}).toArray() as Promise<MongoListCollectionsResult>).then(collections => collections.map(collection => ({ name: collection.name })));
	}));
}
