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
				.handler(shared.createHandler(list))
				.parent()
			.command("create", {
					title: "creates a new collection",
					returns: "collection",
					syntax: [
						"create collection (collectionName string)",
						"create collection (collectionName string) in (dbname string)"
					]
				})
				.endpoint("{ dbname }/collections/create/{ collectionName }")
				.handler(shared.createHandler(create))
				.parent()
			.command("insertOne", {
					title: "inserts a document",
					returns: "map",
					syntax: [
						"insert (doc map) into collection (collectionName string)",
						"insert (doc map) into collection (collectionName string) in (dbname string)"
					]
				})
				.method("post")
				.endpoint("{ dbname }/collection/{ collectionName }/insert-one")
				.handler(shared.createHandler(insertOne));
}

type MongoListCollectionsResult = Array<{ name: string; options: any; }>;
function list(request: connector.server.Request): Promise<shared.Collection[]> {
	return shared.db(request.data("dbname")).then(db => {
		return (db.listCollections({}).toArray() as Promise<MongoListCollectionsResult>).then(collections => collections.map(collection => ({ name: collection.name })));
	});
}

function create(request: connector.server.Request): Promise<shared.Collection> {
	return shared.db(request.data("dbname")).then(db => {
		return db.createCollection(request.data("collectionName")).then(collection => ({ name: collection.collectionName }));
	});
}

type Document = {
	[key: string]: any;
}
type SavedDocument = Document & { _id: string };
function insertOne(request: connector.server.Request): Promise<SavedDocument> {
	let doc = request.data("doc");

	if (typeof doc === "string") {
		doc = JSON.parse(doc);
	}

	return shared.db(request.data("dbname")).then(db => {
		return db
			.collection(request.data("collectionName"))
			.insertOne(doc)
			.then(result => Object.assign({}, doc, { _id: result.insertedId }));
	});
}
