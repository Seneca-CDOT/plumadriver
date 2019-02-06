#!/bin/bash
curDir=$(basename `pwd`)
if [ $curDir != 'JSDOM-Driver' ] #check to see if script is being run form the JSDOM-Driver directory 
then
    echo "tests are meant to be run inside the \"JSDOM-Driver\" folder"
    echo "change to proper diretory and run script again"
    exit 1
fi

echo "this script will kill all instances of nodeJS once finished, would you like to continue(y/n)? " 

read stdin

if [[ $stdin == [Nn] ]]; then
    echo "Exiting"
    exit
fi

if [[ $stdin != [YyNn] ]]; then
    echo "Invalid input, exiting"
    exit
fi


if [ $# -eq 0 ]
    then
        echo "no test script provided...exiting"
        exit 1
else 
    var=`pwd`
    gnome-terminal -x sh -c "node $var/driver/jsdom-webdriver.js; exec bash"
    echo "waiting for server to start..."
    sleep 3
    gnome-terminal -x sh -c "node $1; exec bash"
    sleep 2
    echo "terminating all instances of nodeJS..."
    killall node        
fi


