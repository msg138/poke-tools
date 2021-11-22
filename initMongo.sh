#!/bin/bash
MONGO_INITDB_DATABASE=poketools docker run --name mongodb -dit -e MONGO_INITDB_DATABASE -p 27017:27017 mongo

