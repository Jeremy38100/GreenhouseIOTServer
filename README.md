# GreenhouseIOTServer

Server side of GreenhouseIOT App

___

## Requirements

You need to install : 

- NodeJS [here](https://nodejs.org)
- Mongodb [here](https://www.mongodb.com)
- Nodemon with the command `npm install -g nodemon`

___

## Installation

To install the project : 

- run `npm install`
- run `npm run dev` 
- The project will run on [http://localhost:8101](http://localhost:8101)

___

## Development

#### Project structure

The project is following this structure :

- root
	* node_modules : for npm modules
	* server : the main folder which contains all the code
		+ config : contains the configuration of the server, with secret API keys of external modules
		+ entities : described below
		+ services : folder containing some utils to use external modules
		+ logger.js : a basic logger
		+ provider.js : mongodb connection
		+ routes.js : contains all routes declaration and API auth verification
		+ server.js : the main module to run the server
	* test : for testing (run `npm run test`)

#### Development rules 

The following list of rules is applicable for the "server" folder.

- The entities folder contains all mongodb entities. Each entity is described in a model.js file.
- All entities are a subclass of the base entity. There are 2 classes : Route and Controller. Both of them are defined in the "base" folder. This base entity is useful because you don't need to rewrite the code for each entity.
- Each file begins by the `"use strict";` instruction.
- Don't import a controller in an other controller, it will create circular dependencies otherwise. If you need an other controller to access data from an other controller, import the controller in the routes.js file and do your operations in this file.


How to create an entity : 

- create a folder `entity_name`.
- create a file `model.js` in this folder.
- create a file `controller.js` and create a "Controller" class which extends the "EntityBase", and import the model in this class. 
- create a file `routes.js` and create a "Route" class which extends the "RouteBase", and import the controller in this class.
- add the routes to the "server/entities/main.router.js" file, or in the "server/entities/public.router.js" if you want your data to be public but be careful. 


So your new entity looks like :

- entity_name
	* controller.js
	* routes.js
	* model.js

WARNING : Each model needs to contain the fields contained in the BaseFields.js file. So basically you create your model like this : 

```js
"use strict";

const mongoose    = require('mongoose');
const _           = require('underscore');
const BaseFields  = require('../BaseFields');

const fields = _.extend(_.clone(BaseFields), {
  my_attribute: {type: mongoose.Schema.Types.ObjectId, required: true},
  ...
});

const schema = new mongoose.Schema(fields);

module.exports = function (mongoose) {
  return mongoose.model('my_model', schema);
};

```

## Documentation

### API documentation

We use the raml to documentate the API. 

You can find some syntax highlighters here :

[For sublime text](https://github.com/mulesoft-labs/raml-sublime-plugin)

[For atom](https://atom.io/packages/raml)

[For Visual Studio](https://marketplace.visualstudio.com/items?itemName=MuleSoftInc.RAMLToolsforNET)


It is used to describe what each route does.

You can install npm dependencies by executing the `install.sh` script in the /doc folder

Then you just need to run the `generate.sh` script in the /doc folder to generate the .html files into the same folder.
