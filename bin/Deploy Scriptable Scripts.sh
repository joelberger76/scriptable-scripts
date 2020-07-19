#!/bin/sh

rsync -a --exclude .git/ ~/Code/scriptable-scripts/scripts/ ~/Library/Mobile\ Documents/iCloud\~dk\~simonbs\~Scriptable/Documents/ --delete

