#!/bin/bash

echo "Configuring dragon-stack-test..."

heroku pg:reset DATABASE

heroku pg:psql --app dragon-stack-test < ./backend/bin/sql/account.sql
heroku pg:psql --app dragon-stack-test < ./backend/bin/sql/generation.sql
heroku pg:psql --app dragon-stack-test < ./backend/bin/sql/dragon.sql
heroku pg:psql --app dragon-stack-test < ./backend/bin/sql/trait.sql
heroku pg:psql --app dragon-stack-test < ./backend/bin/sql/dragonTrait.sql
heroku pg:psql --app dragon-stack-test < ./backend/bin/sql/accountDragon.sql

heroku run node ./backend/bin/insertTraits_client.js

echo "dragon-stack-test configured!"