/**
 * Created by nitzan on 20/02/2017.
 */

import * as mongo from "mongodb";

export type MongoFacade = {
	db(name: string): Promise<mongo.Db>;
	admin(): Promise<mongo.Admin>;
}