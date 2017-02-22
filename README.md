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
You can pass the `port` and `host` to the connector when running it:

**Port**  
`/CONNECTOR > node ./scripts/bin/index.js -p 5454`  
Or  
`/CONNECTOR > node ./scripts/bin/index.js --port 5454`

**Host**  
`/CONNECTOR > node ./scripts/bin/index.js -h localhost`  
Or  
`/CONNECTOR > node ./scripts/bin/index.js --host 0.0.0.0`
