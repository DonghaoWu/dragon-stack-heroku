# Dragon-stack-heroku

## Deploy on heroku:

1. heroku -commands

```bash
$ heroku login 

$ heroku create <your-app-name>

$ heroku addons:create heroku-postgresql:hobby-dev --name=<your-db-name>

$ heroku addons:attach <your-db-name> --app=<your-app-name>
```

2. Add env variable in heroku website setting.

```bash
STRING_HASH_SECRET = 'hello'
```

3. Deploy

```bash
$ git remote -v

$ heroku git:remote -a <your-app-name>

$ git add .

$ git commit -m'ready for deploy'

$ git push heroku main

$ npm run configure-db-heroku

$ heroku ps:scale web=1

$ heroku open
```

## Run the app locally.

1. Add a redux dev tool..

- ./frontend/src/redux/store.js

```js
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import rootReducer from './reducers';

const initialState = {};

const middleware = [thunk];

const store = createStore(
    rootReducer, 
    initialState, 
    // applyMiddleware(...middleware),
    composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
```

2. Use pool connection.(Can either keep client way).

- ./backend/databaseConnection.js

```js
require('dotenv').config();
const { Pool } = require('pg');

const db = new Pool({
    user: process.env.POSTGRE_USER,
    host: process.env.POSTGRE_HOST,
    database: process.env.POSTGRE_LOCAL_DATABASE,
    password: process.env.POSTGRE_password,
    port: process.env.POSTGRE_PORT
});

module.exports = db;
```

3. Comment out the `db.connect()` code.(You can keep this if you use client way)

- ./backend/app/models/generation/table.js

```js
const db = require('../../../databaseConnection');

// db.connect();

class GenerationTable {
    static storeGeneration(generation) {
        return new Promise((resolve, reject) => {
            db.query('INSERT INTO generation(expiration) VALUES($1) RETURNING id',
                [generation.expiration],
                (error, response) => {
                    if (error) return reject(error);

                    const generationId = response.rows[0].id;
                    resolve({ generationId });
                }
            )
        })
    };
}

module.exports = GenerationTable;
```

4. Check two files:

- ./backend/.env

```bash
STRING_HASH_SECRET = 'hello'

POSTGRE_USER = 'noah'

POSTGRE_HOST= 'localhost'

POSTGRE_LOCAL_DATABASE= 'dragonstackdb'

POSTGRE_PASSWORD= '12345'

POSTGRE_PORT= 5432
```

- ./backend/bin/configure_db_local.sh

```bash
#!/bin/bash

export PGPASSWORD='12345'

echo "Configuring dragonstackdb..."

dropdb -U noah dragonstackdb
createdb -U noah dragonstackdb

psql -U noah dragonstackdb < ./bin/sql/account.sql
psql -U noah dragonstackdb < ./bin/sql/generation.sql
psql -U noah dragonstackdb < ./bin/sql/dragon.sql
psql -U noah dragonstackdb < ./bin/sql/trait.sql
psql -U noah dragonstackdb < ./bin/sql/dragonTrait.sql
psql -U noah dragonstackdb < ./bin/sql/accountDragon.sql

node ./bin/insertTraits_pool.js

echo "dragonstackdb configured!"
```

5. Start your local postgre server.

6. Bash commands:

```bash
$ npm run configure-db-local

$ npm run dev
```