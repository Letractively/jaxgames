#!/bin/bash
#============================================================================================================================
# Jax Games Build Script - 'compiles' the game into a release folder with compressed scripts
# this is a shell script for Mac OS X (similar to a .bat file in Windows)
#
# HOW TO RUN THIS FILE:
# you have to make this file executable before you can run it. simply double clicking won't work.
# open the Terminal located in /applications/utilities/ and enter
#   cd /library/webserver/documents/jax_games/_build
# (change the path to elsewhere if you checked-out jaxgames to a different location)
# then enter
#   chmod +x build_mac.command
# now you can double click this file in the Finder to run it
#============================================================================================================================
# change directory, to the directory of this script (because double clicking on this script uses home directory instead)
cd "`dirname "$0"`"
clear
echo "==============================================================================="
echo "jaxgames build process                                                   v0.3.0"
echo "==============================================================================="
echo "* copy source to release directory"
echo "-------------------------------------------------------------------------------"
echo "  removing old release..."
# rm: remove files
# -rf = recurse sub folders, and do not prompt to delete
rm -rf ./release
# copy the current source, to release directory using rsync
# -r = recurse into directories
# -delete-excluded = delete any files in release folder that are no longer in the original
# -exclude-from = list of files/folders to ignore when copying (read excludes.txt)
echo "  copying new source..."
mkdir ./release
rsync -r --delete-excluded --exclude-from=./libs/excludes.txt ../ ./release
# make the database directory writeable, in case you want to run the release locally to test
chmod -R 777 ./release/server/db
echo "-------------------------------------------------------------------------------"

# merge together all the scripts needed for boot.js. this means we can load one javascript file to include all of the
# libraries for the project (prototype / scriptaculous / json / jax / firebugx)
echo "* merge libraries for boot.js"
echo "-------------------------------------------------------------------------------"
java -jar ./libs/custom_rhino.jar ./libs/merge.js ../js/libs/prototype.js ../js/libs/json.js ./headers/scriptaculous.165.js ../js/libs/scriptaculous/effects.js ../js/libs/firebug/firebugx.js ../js/libs/jax.js ../js/shared.js ./release/js/boot.js
echo "-------------------------------------------------------------------------------"

# run it through the dojo compressor, this will strip the comments and do other optimisations
echo "* compact scripts"
echo "-------------------------------------------------------------------------------"
# find all javascripts (ingoring folders starting with underscore) and compact them
for FILE in `find ./release -regex "\.\/[^_]*\.js"`
do
        echo "  compacting $FILE..."
        java -jar ./libs/custom_rhino.jar -opt -1 -c "$FILE" > "$FILE.temp"
        mv -f "$FILE.temp" "$FILE"
done
echo "-------------------------------------------------------------------------------"

# run the compressed scripts through Dean Edward's Packer for even more shrinkage
# this will only be effective on larger scripts (cards.js is too short)
echo "* compress scripts (this will take a long time)"
echo "-------------------------------------------------------------------------------"
# find all javascript files (ignoring files starting with underscore) at least 4000 bytes in size
# the packer will generally producer _larger_ files when feeding it very small files to begin with
for FILE in `find ./release -size +4000c -regex "\.\/[^_]*\.js"`
do
        java -jar ./libs/custom_rhino.jar ./libs/packer.js "$FILE" "$FILE"
done
echo "-------------------------------------------------------------------------------"

# the compression will have removed all comments, add new headers and licence blocks
echo "* add headers"
echo "-------------------------------------------------------------------------------"
java -jar ./libs/custom_rhino.jar ./libs/merge.js ./headers/boot.js ./release/js/boot.js ./release/js/boot.js
# find all javascript files (ignoring boot.js and folders starting with underscore). these use the standard header
for FILE in `find ./release -regex "\.\/[^_]*[^(?:boot)]\.js"`
do
        java -jar ./libs/custom_rhino.jar ./libs/merge.js ./headers/jaxgames.js "$FILE" "$FILE"
done
echo "-------------------------------------------------------------------------------"

# zip the release
# -r = recurse subdirectories
# -X = exclude Mac OS only file attributes
# -9 = maximum compression
# -x \*.db = exclude Windows Thumbs.db files
# -x \*.sqlite = exclude the sqlite database
echo "* create zip file"
echo "-------------------------------------------------------------------------------"
rm ./JaxGames.zip
zip -r -X -9 ./JaxGames.zip ./release/ -x \*.db -x \*.sqlite
echo "-------------------------------------------------------------------------------"

echo "build is complete"
echo "==============================================================================="