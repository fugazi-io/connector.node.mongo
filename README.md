# connector.node.mongo

A fugazi connector for MongoDB which adds the ability to use mongo from the [fugazi terminal client](https://github.com/fugazi-io/webclient).

## Installing
The connector requires [node.js](https://nodejs.org/en/) to run, if you don't have it then [download](https://nodejs.org/en/download/) or use [a package manager](https://nodejs.org/en/download/package-manager/).  

The package can be found in [npm @fugazi/connector.mongo](https://www.npmjs.com/package/@fugazi/connector.mongo):
```bash
npm install @fugazi/connector.mongo
```

You then need to compile the typescript files:
```bash
npm run compile
// or
node_modules/typescript/bin/tsc -p scripts
```

## Running
```bash
npm run start
// or
node scripts/bin/index.js
```

If you want to pass arguments then:
```bash
npm run start -- --mongo-host 3232
// or
node scripts/bin/index.js --mongo-host 3232
```

### Options
You can pass the following options to the connector when running it:

#### --mongo-port 
The port to which the mongo service is bound, default is `27017`  
```bash
node scripts/bin/index.js --mongo-port 5454
```

#### --mongo-host  
The host to which the mongo service is bound, default is `localhost`  
```bash
node scripts/bin/index.js --mongo-host localhost
```

#### --listen-port  
The port to which this connector service is bound, default is `33333`  
```bash
node scripts/bin/index.js --listen-port 23422
```

#### --listen-host  
The host to which this connector service is bound, default is `localhost`  
```bash
node scripts/bin/index.js --listen-host 0.0.0.0
```

## Using
Once the connector service starts it should print something like:
```
info: ===== ROUTES START =====
... served routes ...
info: # Root modules:
info:     /mongo.json
info: ====== ROUTES END ======
info: Connected to mongo at localhost:27017
info: server started. listening on localhost:33333
info: connector started
```

In a fugazi terminal ([http://fugazi.io](http://fugazi.io) or if hosted anywhere else) load the module from the provided url:
```
load module from "http://localhost:33333/mongo.json"
```

Now you're ready to use the mongo module, for example:
```
list dbs
```
Should output the list of databases in the connected mongo.

## Supported commands
The following commands are supported:
 * list dbs
 * create db
 * drop db
 * list collections in a db
 * create a collection in a db
 * insert one document to a collection
 * find one document with a given field equals a given value
 * list documents in a collection
 
 More commands to follow.
 
 ## Contribution
 We'll be happy to get help with this connector (as with all [fugazi repos](https://github.com/fugazi-io)), for example to 
 add unimplemented commands (more info in [Add a MongoDB command](https://github.com/fugazi-io/connector.node.mongo/wiki/Add-a-MongoDB-command)).  
 
 ## Contact
 Feel free to [create issues](https://github.com/fugazi-io/connector.node.mongo/issues) if you're running into trouble, 
 and welcome to ask any question in [our gitter](https://gitter.im/fugazi-io/Lobby).
