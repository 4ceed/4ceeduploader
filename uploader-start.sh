#!/bin/bash

# add/replace if variable is non empty
# $1 = variable to replace/remove
# $2 = new value to set
function update_conf() {
    local query
    if [ "$1" == "" ]; then return 0; fi

    # First remove existing configuration info
    if [ -e uploader.conf ]; then
        if [ "$2" != "" ]; then
            query="$1"
	        mv uploader.conf uploader.conf.old
            grep -v "^$query" uploader.conf.old > uploader.conf
            rm uploader.conf.old
	    fi
    fi

    # Then, update config info
    if [ "$2" != "" ]; then
        echo "$1=\"$2\"" >> uploader.conf
    fi
}

# If env variables exist, reset configuration information 
update_conf   "CURATOR_HOME" "$CURATOR_HOME"
update_conf   "CURATOR_API_URL" "$CURATOR_API_URL"
update_conf   "UPLOADER_HOME" "$UPLOADER_HOME"

# If env variables do not exist, or if you are running in 
# local mode, load env variables from configuration file
source uploader.conf
export CURATOR_HOME
export CURATOR_API_URL
export UPLOADER_HOME

# Start uploader 
php -S 0.0.0.0:8000
