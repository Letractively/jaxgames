#!/bin/bash
#============================================================================================================================
# Jax Games Build Script - 'compiles' the game into a release folder with compressed scripts
# licenced under the Creative Commons Attribution 3.0 License: http://creativecommons.org/licenses/by/3.0/
# Jax, Jax Games (c) copyright Kroc Camen 2005-2007. http://code.google.com/p/jaxgames/
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
# THE RUN DOWN:
# -------------
# [1]: check dependencies - ensure everything this script needs to run is present, and any optional extras
# [2]: create archive of source code - copy the current source to a new folder, and create an archive from it
# [3]: create jax distribution - create an archive of just the jax library
# [4]: combine javascript and css files - find files using `$import`\`@import` and inject referenced files
# [5]: copy source to release directory - copy to release folder, removing all developer-only files
# [6]: compact scripts - strip scripts of comments and spaces
# [7]: compress scripts - heavily compress the scripts with Dean Edward's Packer
# [8]: add headers - add headers/licence blocks to the files
# [9]: package the release - create archive of resulting compiled release


# change directory, to the directory of this script
# (because double clicking on this script uses home directory instead)
cd "`dirname "$0"`"
# 'Present Working Directory' always gives absolute paths.
WORKING_DIR="`pwd`"

# log to file, and display on stdout at the same time
# taken from http://www.travishartwell.net/blog/2006/08/19_2220
# ---------------------------------------------------------------------------------------------------------------------------
OUTPUT_LOG="$WORKING_DIR/build.log"    # absolute path must be used because on exit the current directory may be different
OUTPUT_PIPE="$WORKING_DIR/build.pipe"  # temporary file for logging

if [ ! -e $OUTPUT_PIPE ]; then mkfifo $OUTPUT_PIPE; fi
if [ -e $OUTPUT_LOG ]; then rm $OUTPUT_LOG; fi
exec 3>&1 4>&2
tee $OUTPUT_LOG < $OUTPUT_PIPE >&3 &
tpid=$!
exec > $OUTPUT_PIPE 2>&1

# on any exit command, return the stdout & stderr to normal, and remove the temporary pipe file
trap 'exec 1>&3 3>&- 2>&4 4>&-; wait $tpid; rm $OUTPUT_PIPE;' EXIT
trap 'die "! script terminated"' INT TERM  #clean up if the user presses ^c
# ---------------------------------------------------------------------------------------------------------------------------

clear 2>/dev/null  #ignore, as errors when running from TextMate
echo "==============================================================================="
echo "jaxgames build process                                                   v0.4.3"
echo "==============================================================================="

# [1]:
echo "[1] checking dependencies for build..."
echo "-------------------------------------------------------------------------------"
# Rhino is a java implementation of javascript. Dojo <dojotoolkit.org> uses a custom version of Rhino to compact javascript
# files into a smaller space. this will also make them more compatible with Dean Edward's packer.
# if "custom_rhino.jar" does not exist, download it... (saves us 700 kb in our SVN)
if ! [[ -e ./libs/custom_rhino.jar ]]
then
	echo "* downloading custom_rhino.jar..."
	# curl: download a file
	# -o = save to disk
	# -S = show errors on screen
	# -# = show a progress bar instead of details
	# -A = set the user-agent to use, in this case we want to alert Dojo that this script is doing a direct download
	curl -o ./libs/custom_rhino.jar -S -\# -A "Mozilla/4.0 (Jax Games Build Script - http://code.google.com/p/jaxgames)" "http://svn.dojotoolkit.org/dojo/trunk/buildscripts/lib/custom_rhino.jar"
	if [ $? -gt 0 ]; then echo "! downloading of custom_rhino.jar failed"; exit 1; fi
else
	echo "@ custom_rhino.jar is present"
fi
# if RAR <rarlabs.com> is present the build process will also create a RARchive which will provide much more compression.
# to install RAR, download the mac os x tar.gz, unpack and then copy the extracted 'rar' folder to "/usr/local/bin/"
# (use 'Go > Go to Folder' in finder to get there)
if [ -e /usr/local/bin/rar/rar ]
then
	echo "@ RAR is present, a RARchive will also be made..."
	USE_RAR=true
else
	echo "! RAR is not present, a RARchive will not be made"
	USE_RAR=false
fi
echo "-------------------------------------------------------------------------------"
# create the "/_build/release/" folder, ignore error generated if already present
mkdir ./release 2>/dev/null
cd release

# [2]:
# create archive of source code. distributing the source code to somebody who hasn't got SVN can be difficult. simply zipping
# the directory will also include all the hidden .svn folders and a lot of unnecessary files bloating the zip file massively.
# for your convenience this build script will zip the source code for easy sending
echo "[2] create Jax Games source code distribution"
echo "-------------------------------------------------------------------------------"
echo "* copying current source to temp source directory"
# rm: remove files
# -rf = recurse sub folders, and do not prompt to delete
rm -rf ./source 2>/dev/null
# mkdir: make directory
mkdir ./source
# rsync: copy files from one place to the other (with powerful options)
# -r = recurse into directories
# --times = keep modified times (makes syncing a copy with FTP easier)
# --delete-excluded = delete any files that are no longer in the original
# --exclude-from = exclude files as specified in "libs/rsync_excludes.txt"
# --exclude 'js/libs/scriptaculous/*/' = exclude any subfolders in the scriptaculous folder (there may be unzipped copies of
#                                        scriptaculous and prototype there that do not need to be included)
rsync -r --times --delete-excluded --exclude-from=./../libs/rsync_excludes.txt --exclude 'js/_libs/scriptaculous/*/' ../../ ./source

echo "* creating ZIP archive..."
rm ./jax-games-src.zip 2>/dev/null
# ZIP
# -r = recurse subdirectories
# -X = exclude Mac OS only file attributes (MS-DOS Compatible)
# -9 = maximum compression
# -x \*.db = exclude Windows Thumbs.db files
zip -r -X -9 ./jax-games-src.zip ./source -x \*.db
if [ $? -gt 0 ]; then echo "! creation of source zip file failed"; exit 2; fi
# RAR
# a = create new archive ('add')
# -idcp = disable copyright notice 'c', and progress indicator 'p'
# -k = lock, and prevent any further changes
# -m5 = best compression
# -r = recurse subdirectories
# -s = create solid archive (extra compression)
if [ "$USE_RAR" = "true" ]
then
	rm ./jax-games-src.rar 2>/dev/null
	echo "-------------------------------------------------------------------------------"
	echo "@ creating RAR archive..."
	/usr/local/bin/rar/rar a -idcp -k -m5 -r -s ./jax-games-src.rar ./source
	if [ $? -gt 0 ]; then echo "! creation of source rar file failed"; exit 2; fi
fi
echo "-------------------------------------------------------------------------------"

# [3]:
# the jax component of jax games can be used as a common library for browser to browser AJAX
echo "[3] create Jax distribution"
echo "-------------------------------------------------------------------------------"
cd source
# ZIP
echo "* creating ZIP archive..."
rm ../jax-dist.zip 2>/dev/null
zip -r -X -9 ../jax-dist.zip ./jax -x \*.db
if [ $? -gt 0 ]; then echo "! creation of jax distribution zip file failed"; exit 3; fi
# RAR
if [ "$USE_RAR" = "true" ]
then
	rm ../jax-dist.rar 2>/dev/null
	echo "-------------------------------------------------------------------------------"
	echo "@ creating RAR archive..."
	/usr/local/bin/rar/rar a -idcp -k -m5 -r -s ../jax-dist.rar ./jax
	if [ $? -gt 0 ]; then echo "! creation of jax distribution rar file failed"; exit 3; fi
fi
cd ../..
echo "-------------------------------------------------------------------------------"

# [4]:
# combine together scripts and css into one to increase speed and reduce file sizes
echo "[4] combine javascript and css files"
echo "-------------------------------------------------------------------------------"
echo "* combine libraries for boot.js..."
java -jar ./libs/custom_rhino.jar ./libs/rhino_makeboot.js
if [ $? -gt 0 ]; then echo "! combining of libraries for boot.js failed"; exit 4; fi

echo ""
echo "* combine game javascripts and css..."
for FILE in `find -E ./release/source -regex "\.\/[^_]*\.(js|css)"`
do
	java -jar ./libs/custom_rhino.jar ./libs/rhino_import.js "$FILE"
	if [ $? -gt 0 ]; then echo "! combining of $FILE's dependecies failed"; exit 4; fi
done
echo "-------------------------------------------------------------------------------"

# [5]:
cd release
echo "[5] copy source to release directory"
echo "-------------------------------------------------------------------------------"
echo "* removing old release..."
rm -rf ./jaxgames 2>/dev/null

echo "* copying new source..."
mkdir ./jaxgames
# copy the current source, to release directory using rsync
# -r = recurse into directories
# --times = keep modified times (makes syncing a copy with FTP easier)
# --delete-excluded = delete any files in release folder that are no longer in the original
# --exclude-from = list of files/folders to ignore when copying (read "rsync_excludes.txt")
rsync -r --times --delete-excluded --exclude-from=./../libs/rsync_excludes.txt --exclude '_*' --exclude '/jax/jax.js' --exclude '/jax/libs/' ./source/* ./jaxgames
if [ $? -gt 0 ]; then echo "! copying of source to release directory failed"; exit 5; fi
# make the database directory writeable, in case you want to run the release locally to test
# e.g. "http://localhost/jaxgames/_build/release/jaxgames/"
chmod -R 777 ./jaxgames/jax/db
echo "-------------------------------------------------------------------------------"
rm -rf ./source 2>/dev/null
cd ..

# [6]:
# run it through the dojo compressor, this will strip the comments and do other optimisations
echo "[6] compact scripts"
echo "-------------------------------------------------------------------------------"
# find all javascripts (ignoring folders starting with underscore) and compact them
for FILE in `find ./release/jaxgames -regex "\.\/[^_]*\.js"`
do
	echo "  compacting $FILE..."
	java -jar ./libs/custom_rhino.jar -opt -1 -c "$FILE" > "$FILE.temp"
	if [ $? -gt 0 ]; then echo "! compacting of $FILE failed"; exit 6; fi
	mv -f "$FILE.temp" "$FILE"
done
echo "-------------------------------------------------------------------------------"

# [7]:
# run the compacted scripts through Dean Edward's Packer for even more shrinkage
echo "[7] compress scripts (this will take a long time)"
echo "-------------------------------------------------------------------------------"
# find all javascript files (ignoring folders starting with underscore) at least 4000 bytes in size
# the packer will generally producer _larger_ files when feeding it very small files to begin with
for FILE in `find ./release/jaxgames -size +4000c -regex "\.\/[^_]*\.js"`
do
	java -jar ./libs/custom_rhino.jar ./libs/rhino_packer.js "$FILE" "$FILE"
	##YUICompressor can be used instead of DOJO's custom_rhino.jar
	#java -jar ./libs/YUICompressor/Build/yuicompressor-1.0.jar --warn -o "$FILE" "$FILE"
	if [ $? -gt 0 ]; then echo "! compressing of $FILE failed"; exit 7; fi
done
echo "-------------------------------------------------------------------------------"

# [8]:
# the compression will have removed all comments, add new headers and licence blocks
echo "[8] add headers"
echo "-------------------------------------------------------------------------------"
# boot.js has its own header as it contains all the third party libraries
java -jar ./libs/custom_rhino.jar ./libs/rhino_combine.js ./headers/boot.js ./release/jaxgames/js/boot.js ./release/jaxgames/js/boot.js
if [ $? -gt 0 ]; then echo "! adding header to boot.js failed"; exit 8; fi
# find all javascript files (ignoring boot.js and folders starting with underscore). these use the standard header
for FILE in `find ./release/jaxgames -regex "\.\/[^_]*[^(?:boot)]\.js"`
do
	java -jar ./libs/custom_rhino.jar ./libs/rhino_combine.js ./headers/jaxgames.js "$FILE" "$FILE"
	if [ $? -gt 0 ]; then echo "! adding header to $FILE failed"; exit 8; fi
done
echo "-------------------------------------------------------------------------------"

# [9]:
# package the release
echo "[9] create zip file of release"
echo "-------------------------------------------------------------------------------"
rm ./release/jax-games-dist.zip 2>/dev/null  #ignore error from this
# ZIP
# -r = recurse subdirectories
# -X = exclude Mac OS only file attributes (MS-DOS Compatible)
# -9 = maximum compression
# -x \*.db = exclude Windows Thumbs.db files
# -x \*.sqlite = exclude the sqlite database
echo "@ creating ZIP archive..."
zip -r -X -9 ./release/jax-games-dist.zip ./release/jaxgames -x \*.db
if [ $? -gt 0 ]; then echo "! creating zip of release failed"; exit 9; fi
# RAR
if [ "$USE_RAR" = "true" ]
then
	rm ./release/jax-games-dist.rar 2>/dev/null
	echo "-------------------------------------------------------------------------------"
	echo "@ creating RAR archive..."
	/usr/local/bin/rar/rar a -idcp -k -m5 -r -s ./release/jax-games-dist.rar ./release/jaxgames
	if [ $? -gt 0 ]; then echo "! creating rar of release failed"; exit 9; fi
fi
echo "-------------------------------------------------------------------------------"
echo "build is complete"
echo "==============================================================================="

#=== end of line ============================================================================================================