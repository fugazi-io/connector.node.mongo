/**
 * Created by nitzan on 21/02/2017.
 */

import { MongoFacade } from "./shared";
import * as connector from "fugazi.connector.node";

let MONGO: MongoFacade;


type MongoListCollectionsResult = Array<{ name: string; options: any; }>;
async function list(ctx: connector.CommandHandlerContext) {
	try {
		const collections: MongoListCollectionsResult = await (await MONGO.db(ctx.params.db)).listCollections({}).toArray();

		ctx.type = "application/json";
		ctx.body = {
			status: 0, // value for fugazi.components.commands.handler.ResultStatus.Success
			value: {
				count: collections.length,
				items: collections.map(collection => {
					return {name: collection.name};
				})
			}
		};
	} catch (e) {
		ctx.type = "application/json";
		ctx.body = {
			status: 1, // value for fugazi.components.commands.handler.ResultStatus.Failure
			error: e.message
		};
	}
}

export function init(builder: connector.Builder, mongo: MongoFacade): connector.Module {
	MONGO = mongo;
	builder.command("/:db/collections", "get", list);

	return {
		title: "collection commands",
		types: {
			collection: {
				title: "a collection",
				type: {
					name: "string"
				}
			},
			collections: {
				title: "collections",
				type: {
					count: "numbers.integer",
					items: "list<collection>"
				}
			}
		},
		commands: {
			list: {
				title: "returns all of the collections in a db",
				returns: "collections",
				syntax: "list collections in (db string)",
				handler: {
					endpoint: "{ db }/collections"
				}
			}
		}
	};
}