#!/bin/zsh
cake build
cd ../table-deploy
ls -1 | xargs rm -rf
mv ../table/public/* .
git add -A
git commit -m "deploy"
git push
echo "Done deploying!"
