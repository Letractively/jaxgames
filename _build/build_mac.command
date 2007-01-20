#!/bin/bash
#============================================================================================================================
# Jax Games Build Script - 'compiles' the game into a release folder with compressed scripts
# licenced under the Creative Commons Attribution 2.5 License: http://creativecommons.org/licenses/by/2.5/
# jax, jax games (c) copyright Kroc Camen 2005-2007
#============================================================================================================================
# HOW TO RUN THIS FILE: (TextMate users can press Cmd+R to run this file!)
# ------------------------------------------------------------------------
# you have to make this file executable before you can run it. simply double clicking won't work.
# open the Terminal located in /applications/utilities/ and enter
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
echo "jaxgames build process                                                   v0.3.2"
echo "==============================================================================="

# [1]:
# Rhino is a java implementation of Javascript. Dojo <dojotoolkit.org> uses a custom version of Rhino to compact javascript
# files into a smaller space. this will also make them more compatible with Dean Edward's packer.
# if custom_rhino.jar does not exist, download it... (saves us 700Kb in our SVN)
if ! [[ -e ./libs/custom_rhino.jar ]]
then
        echo "* downloading custom_rhino.jar"
        echo "-------------------------------------------------------------------------------"
        # curl: download a file
        # -o = save to disk
        # -S = show errors on screen
        # -# = show a progress bar instead of details
        # -A = set the user-agent to use, in this case we want to alert Dojo that this script is doing a direct download
        curl -o ./libs/custom_rhino.jar -S -\# -A "Mozilla/4.0 (Jax Games Build Script - http://code.google.com/p/jaxgames)" "http://svn.dojotoolkit.org/dojo/trunk/buildscripts/lib/custom_rhino.jar"
        echo "-------------------------------------------------------------------------------"
fi

# [2]:
echo "* copy source to release directory"
echo "-------------------------------------------------------------------------------"
echo "  removing old release..."
# rm: remove files
# -rf = recurse sub folders, and do not prompt to delete
rm -rf ./release/jaxgames
mkdir -p ./release/jaxgames
echo "  copying new source..."
# copy the current source, to release directory using rsync
# -r = recurse into directories
# -delete-excluded = delete any files in release folder that are no longer in the original
# -exclude-from = list of files/folders to ignore when copying (read excludes.txt)
rsync -r --delete-excluded --exclude-from=./libs/excludes.txt ../ ./release/jaxgames
# make the database directory writeable, in case you want to run the release locally to test
chmod -R 777 ./release/jaxgames/jax_php/db
echo "-------------------------------------------------------------------------------"

# [3]:
# merge together all the scripts needed for boot.js. this means we can load one javascript file to include all of the
# libraries for the project (prototype / scriptaculous / json / jax / firebugx)
echo "* merge libraries for boot.js"
echo "-------------------------------------------------------------------------------"
java -jar ./libs/custom_rhino.jar ./libs/makeboot.js
echo "-------------------------------------------------------------------------------"

# [4]:
# run it through the dojo compressor, this will strip the comments and do other optimisations
echo "* compact scripts"
echo "-------------------------------------------------------------------------------"
# find all javascripts (ignoring folders starting with underscore) and compact them
for FILE in `find ./release/jaxgames -regex "\.\/[^_]*\.js"`
do
        echo "  compacting $FILE..."
        java -jar ./libs/custom_rhino.jar -opt -1 -c "$FILE" > "$FILE.temp"
        mv -f "$FILE.temp" "$FILE"
done
echo "-------------------------------------------------------------------------------"

# [5]:
# run the compacted scripts through Dean Edward's Packer for even more shrinkage
echo "* compress scripts (this will take a long time)"
echo "-------------------------------------------------------------------------------"
# find all javascript files (ignoring folders starting with underscore) at least 4000 bytes in size
# the packer will generally producer _larger_ files when feeding it very small files to begin with
for FILE in `find ./release/jaxgames -size +4000c -regex "\.\/[^_]*\.js"`
do
        java -jar ./libs/custom_rhino.jar ./libs/packer.js "$FILE" "$FILE"
done
echo "-------------------------------------------------------------------------------"

# [6]:
# the compression will have removed all comments, add new headers and licence blocks
echo "* add headers"
echo "-------------------------------------------------------------------------------"
# boot.js has its own header as it contains all the third party libraries
java -jar ./libs/custom_rhino.jar ./libs/merge.js ./headers/boot.js ./release/jaxgames/js/boot.js ./release/jaxgames/js/boot.js
# find all javascript files (ignoring boot.js and folders starting with underscore). these use the standard header
for FILE in `find ./release/jaxgames -regex "\.\/[^_]*[^(?:boot)]\.js"`
do
        java -jar ./libs/custom_rhino.jar ./libs/merge.js ./headers/jaxgames.js "$FILE" "$FILE"
done
echo "-------------------------------------------------------------------------------"

# [7]:
# zip the release
# -r = recurse subdirectories
# -X = exclude Mac OS only file attributes (MS-DOS Compatible)
# -9 = maximum compression
# -x \*.db = exclude Windows Thumbs.db files
# -x \*.sqlite = exclude the sqlite database
echo "* create zip file"
echo "-------------------------------------------------------------------------------"
rm ./release/JaxGames.zip
zip -r -X -9 ./release/JaxGames.zip ./release/jaxgames -x \*.db -x \*.sqlite
echo "-------------------------------------------------------------------------------"

echo "build is complete"
echo "==============================================================================="

#=== end of line ============================================================================================================