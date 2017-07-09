#!/bin/sh
# Automatically run by "npm install" per package.json

# Vendor files needed for distribution
cp node_modules/bootstrap/dist/css/bootstrap.min.css src/vendor/
cp node_modules/dragula/dist/dragula.min.css src/vendor/
cp node_modules/jquery/dist/jquery.min.js src/vendor/
cp node_modules/dragula/dist/dragula.min.js src/vendor/

cp node_modules/open-iconic/svg/bolt.svg src/images/
cp node_modules/open-iconic/svg/cloud.svg src/images/
cp node_modules/open-iconic/svg/cloudy.svg src/images/
cp node_modules/open-iconic/svg/layers.svg src/images/
cp node_modules/open-iconic/svg/rain.svg src/images/
cp node_modules/open-iconic/svg/sun.svg src/images/

# 3rd party application keys
if [ ! -f src/keys.js ]; then
	cp src/keys-example.js src/keys.js;
fi;
