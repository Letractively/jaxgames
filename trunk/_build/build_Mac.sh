#!/bin/bash
#Jax Games Build Script
#change directory, to the directory of this script (because double clicking on this script uses home directory instead)
cd "`dirname "$0"`"
clear
echo "==============================================================================="
echo "jaxgames build process                                                     v0.1"
echo "==============================================================================="

#copy the current source, to release directory using rsync
# -v = verbose, show copying as it happens
# -r = recurse into directories
# -u = update: only copy files that have changed
# -delete-excluded = delete any files in release folder that are no longer in the original
# -exclude-from = list of files/folders to ignore when copying (read excludes.txt)
echo "* copying source to release directory"
echo "-------------------------------------------------------------------------------"
mkdir ./release
rsync -v -r -u --delete-excluded --exclude-from=./libs/excludes.txt ../ ./release
#make the database directory writeable, in case you want to run the release locally to test
chmod -R 777 ./release/server/db
echo "-------------------------------------------------------------------------------"

#merge together all the scripts needed for boot.js
echo "* merge libraries for boot.js"
echo "-------------------------------------------------------------------------------"
java -jar ./libs/custom_rhino.jar ./libs/merge.js ../js/libs/prototype.js ../js/libs/json.js ./headers/scriptaculous.165.js ../js/libs/scriptaculous/effects.js ../js/libs/firebug/firebugx.js ../js/libs/jax.js ../js/shared.js ./temp.js
echo "-------------------------------------------------------------------------------"

#run it through the dojo compressor, this will strip the comments and do other optimisations
#if someone with l33t bash skills could do some kind of 'find all *.js' and compress routine, it would help
echo "* compacting scripts"
echo "-------------------------------------------------------------------------------"
echo " compacting /js/boot.js..."
java -jar ./libs/custom_rhino.jar -opt -1 -c ./temp.js > ./release/js/boot.js
rm ./temp.js
echo " compacting /js/board.js..."
java -jar ./libs/custom_rhino.jar -opt -1 -c ../js/board.js > ./release/js/board.js
echo " compacting /js/cards.js..."
java -jar ./libs/custom_rhino.jar -opt -1 -c ../js/cards.js > ./release/js/cards.js
echo " compacting /games/blacjax/game.js..."
java -jar ./libs/custom_rhino.jar -opt -1 -c ../games/blacjax/game.js > ./release/games/blacjax/game.js
echo " compacting /games/othello/classes.js..."
java -jar ./libs/custom_rhino.jar -opt -1 -c ../games/blacjax/classes.js > ./release/games/blacjax/classes.js
echo "-------------------------------------------------------------------------------"

#run the compressed scripts through Dean Edward's Packer for even more shrinkage
#this will only be effective on larger scripts (cards.js is too short)
echo "* compressing scripts... (this will take a long time)"
echo "-------------------------------------------------------------------------------"
java -jar ./libs/custom_rhino.jar ./libs/packer.js ./release/js/boot.js ./release/js/boot.js
java -jar ./libs/custom_rhino.jar ./libs/packer.js ./release/games/blacjax/game.js ./release/games/blacjax/game.js
java -jar ./libs/custom_rhino.jar ./libs/packer.js ./release/games/blacjax/classes.js ./release/games/blacjax/classes.js
echo "-------------------------------------------------------------------------------"
echo "Build is complete"
echo "==============================================================================="