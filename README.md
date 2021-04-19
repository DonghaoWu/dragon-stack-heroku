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

2. Check two files:

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

node ./bin/insertTraits_client.js

echo "dragonstackdb configured!"
```

3. Start your local postgre server.

4. Bash commands:

```bash
$ npm run configure-db-local

$ npm run dev
```