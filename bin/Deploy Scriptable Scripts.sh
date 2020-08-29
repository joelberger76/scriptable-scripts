#!/bin/sh

rsync -a --exclude .git/ ~/Code/scriptable-scripts/scripts/ ~/Library/Mobile\ Documents/iCloud\~dk\~simonbs\~Scriptable/Documents/ --delete

ctags --excmd=number --tag-relative=no --fields=+a+m+n+S -f /Users/joel/Library/Application\ Support/BBEdit/Completion\ Data/JavaScript/scriptable-scripts.tags -R /Users/joel/Code/scriptable-scripts/scripts >/dev/null 2>&1