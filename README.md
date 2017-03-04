# connector.node.mongo

A fugazi connector for MongoDB which adds the ability to use mongo from the [fugazi terminal client](https://github.com/fugazi-io/webclient).

Currently the only way to use this connector is to clone the repo, build it and running it.  
When the connector grow in functionality and will mature enough we'll add it to npm.  
The mongo connector depends on the [base node connector](https://github.com/fugazi-io/connector.node) which also isn't mature enough 
to go on npm, because of that it's needed to clone it as well and follow the instructions there in order to run the mongo connector.

## Building & Running
1. Make sure you have a mongo instance up & running
2. Clone the [base connector](https://github.com/fugazi-io/connector.node) and follow the instructions there
3. Clone this repo (let's say that it was cloned to `/CONNECTOR`)
4. Install dependencies: `/CONNECTOR > npm install`
5. Compile the source: `/CONNECTOR > ./node_modules/typescript/bin/tsc -p ./scripts`
6. Run the connector: `/CONNECTOR > node ./scripts/bin/index.js`

### Options
You can pass the following options to the connector when running it:

* **Mongo port** (*--mongo-port*)  
The port to which the mongo service is bound  
Default is *27017*  
Example:  
`/CONNECTOR > node ./scripts/bin/index.js --mongo-port 5454`

* **Mongo host** (*--mongo-host*)  
The host to which the mongo service is bound  
Default is *localhost*  
Example:  
`/CONNECTOR > node ./scripts/bin/index.js --mongo-host localhost`

* **Listen port** (*--listen-port*)  
The port to which this connector service is bound  
Default is *33333*  
Example:  
`/CONNECTOR > node ./scripts/bin/index.js --listen-port 23422`

* **Listen host** (*--listen-host*)  
The host to which this connector service is bound  
Default is *localhost*  
Example:  
`/CONNECTOR > node ./scripts/bin/index.js --listen-host 0.0.0.0`

