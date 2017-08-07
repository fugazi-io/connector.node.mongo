/**
 * Created by nitzan on 13/03/2017.
 */

declare module fugazi {
	function loaded(descriptor: any);
}

(function(): void {
	fugazi.loaded({
		name: "mongo.databases",
		commands: {
			use: {
				title: "select a db",
				returns: "ui.message",
				parametersForm: "arguments",
				syntax: "use (dbname string)",
				handler: (context: fugazi.app.modules.ModuleContext, dbname: string) => {
					if (context.data.has("default.db")) {
						console.log(`previous default db: ${ context.data.get("default.db") }`);
					}

					context.data.set("default.db", dbname);
					return `default selected database set to "${ dbname }"`;
				}
			}
		}
	});
})();
