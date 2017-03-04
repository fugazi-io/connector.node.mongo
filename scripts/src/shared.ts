/**
 * Created by nitzan on 20/02/2017.
 */

import * as mongo from "mongodb";
import { CommandHandlerContext } from "fugazi.connector.node";

export type MongoFacade = {
	db(name: string): Promise<mongo.Db>;
	admin(): Promise<mongo.Admin>;
}

export async function executeMongoCommand(ctx: CommandHandlerContext, command: () => void) {
	try {
		await command();
	} catch (e) {
		ctx.type = "application/json";
		ctx.body = {
			status: 1, // value for fugazi.components.commands.handler.ResultStatus.Failure
			error: e.message
		};
	}
}