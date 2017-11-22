/**
 * Created by nitzan on 21/02/2017.
 */

import * as shared from "./shared";
import * as connector from "@fugazi/connector";

const COMMANDS = [] as Array<(module: connector.components.ModuleBuilder) => void>;

export function init(parentModule: connector.components.ModuleBuilder): void {
	const module = parentModule.module("collections")
		.type({
			"name": "collections",
			"type": "list<collection>"
		})
		.type({
			"name": "document",
			"type": "map"
		});

	COMMANDS.forEach(fn => fn(module));
}

type MongoListCollectionsResult = Array<{ name: string; options: any; }>;
function list(request: connector.server.Request): Promise<shared.Collection[]> {
	return shared.db(request.data("dbname")).then(db => {
		return (db.listCollections({}).toArray() as Promise<MongoListCollectionsResult>).then(collections => collections.map(collection => ({ name: collection.name })));
	});
}
COMMANDS.push((module: connector.components.ModuleBuilder) => {
	module
		.command("list", {
			title: "returns all of the collections in a db",
			returns: "collections",
			syntax: [
				"list collections",
				"list collections in (dbname string)"
			]
		})
		.endpoint("{ dbname }/collections")
		.handler(shared.createHandler(list));
});

function create(request: connector.server.Request): Promise<shared.Collection> {
	return shared.db(request.data("dbname")).then(db => {
		return db.createCollection(request.data("collectionName")).then(collection => ({ name: collection.collectionName }));
	});
}
COMMANDS.push((module: connector.components.ModuleBuilder) => {
	module
		.command("create", {
			title: "creates a new collection",
			returns: "collection",
			syntax: [
				"create collection (collectionName string)",
				"create collection (collectionName string) in (dbname string)"
			]
		})
		.endpoint("{ dbname }/collections/create/{ collectionName }")
		.handler(shared.createHandler(create));
});

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
COMMANDS.push((module: connector.components.ModuleBuilder) => {
	module
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
});

function findOne(request: connector.server.Request): Promise<SavedDocument> {
	let query = request.data("query");

	if (typeof query === "string") {
		query = JSON.parse(query);
	}

	return shared.db(request.data("dbname")).then(db => {
		return db
			.collection(request.data("collectionName"))
			.findOne(query);
	});
}

COMMANDS.push((module: connector.components.ModuleBuilder) => {
	module
		.command("findOne", {
			title: "finds first document that matches the collection",
			returns: "document",
			syntax: [
				"find one in collection (collectionName string) where (query map)",
				"find one in collection (collectionName string) in (dbname string) where (query map)"
			]
		})
		.method("post")
		.endpoint("{ dbname }/collection/{ collectionName }/findOne")
		.handler(shared.createHandler(findOne));
});

function findOneEquals(request: connector.server.Request): Promise<SavedDocument> {
	let doc = request.data("doc");

	if (typeof doc === "string") {
		doc = JSON.parse(doc);
	}

	return shared.db(request.data("dbname")).then(db => {
		return db
			.collection(request.data("collectionName"))
			.findOne({ [request.data("field")]: request.data("value") });
	});
}

COMMANDS.push((module: connector.components.ModuleBuilder) => {
	module
		.command("findOneEquals", {
			title: "finds a document filtered by a single field",
			returns: "document",
			syntax: [
				"find one in collection (collectionName string) where (field string) is (value string)",
				"find one in collection (collectionName string) in (dbname string) where (field string) is (value string)"
			]
		})
		.method("post")
		.endpoint("{ dbname }/collection/{ collectionName }/findOneEquals/{ field }/is/{ value }")
		.handler(shared.createHandler(findOneEquals));
});

function doFind(dbname: string, collectionName: string, query: any): Promise<SavedDocument[]> {
	return shared.db(dbname).then(db => {
		return db
			.collection(collectionName)
			.find(query)
			.toArray();
	});
}

function find(request: connector.server.Request): Promise<SavedDocument[]> {
	return doFind(
		request.data("dbname"),
		request.data("collectionName"),
		JSON.parse(request.data("query"))
	);
}

COMMANDS.push((module: connector.components.ModuleBuilder) => {
	module
		.command("find", {
			title: "finds documents with a query",
			returns: "list<document>",
			syntax: [
				"find in collection (collectionName string) where (query map)",
				"find in collection (collectionName string) in (dbname string) where (query map)"
			]
		})
		.method("post")
		.endpoint("{ dbname }/collection/{ collectionName }/find/{ query }")
		.handler(shared.createHandler(find));
});

function listDocuments(request: connector.server.Request): Promise<SavedDocument[]> {
	return doFind(
		request.data("dbname"),
		request.data("collectionName"),
		{}
	);
}

COMMANDS.push((module: connector.components.ModuleBuilder) => {
	module
		.command("list", {
			title: "lists documents in a collection",
			returns: "list<document>",
			syntax: [
				"list documents in collection (collectionName string) in (dbname string)",
            ]
        })
        .method("get")
        .endpoint("{ dbname }/collection/{ collectionName }/list")
        .handler(shared.createHandler(listDocuments));
});

function deleteOne(request: connector.server.Request): Promise<number> {
	return shared.db(request.data("dbname")).then(db => {
		return db
			.collection(request.data("collectionName"))
			.deleteOne(JSON.parse(request.data("filter")))
			.then(result => result.deletedCount || 0);
});

COMMANDS.push((module: connector.components.ModuleBuilder) => {
    module
        .command("deleteOne", {
            title: "deletes a document",
            returns: "number",
            syntax: [
				"delete document in collection (collectionName string) in (dbname string) where (filter map)",
            ]
        })
        .method("delete")
        .endpoint("{ dbname }/collection/{ collectionName }/deleteOne/{ filter }")
        .handler(shared.createHandler(deleteOne));
});

function deleteMany(request: connector.server.Request): Promise<number> {
	return shared.db(request.data("dbname")).then(db => {
		return db
			.collection(request.data("collectionName"))
			.deleteMany(JSON.parse(request.data("filter")))
			.then(result => result.deletedCount || 0);
	});
}

COMMANDS.push((module: connector.components.ModuleBuilder) => {
    module
        .command("deleteMany", {
            title: "deletes documents",
            returns: "number",
            syntax: [
				"delete documents in collection (collectionName string) in (dbname string) where (filter map)",
            ]
        })
        .method("delete")
        .endpoint("{ dbname }/collection/{ collectionName }/deleteMany/{ filter }")
        .handler(shared.createHandler(deleteMany));
});

function countDocuments(request: connector.server.Request): Promise<number> {
	return shared.db(request.data("dbname")).then(db => {
		return db
			.collection(request.data("collectionName"))
			.count(JSON.parse(request.data("query")));
	});
}

COMMANDS.push((module: connector.components.ModuleBuilder) => {                 
	module
		.command("count", {
			title: "count documents in a collection",
			returns: "number",
			syntax: [
				"count documents in collection (collectionName string) where (query map)",
				"count documents in collection (collectionName string) in (dbname string) where (query map)",
			]
		})
		.method("get")
		.endpoint("{ dbname }/collection/{ collectionName }/countd/{ query }")
		.handler(shared.createHandler(countDocuments));
});