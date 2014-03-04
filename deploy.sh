#!/bin/zsh
cake build
cd ../table-deploy
ls -1 | xargs rm -rf
cp ../table/public/* .
mkdir ./styles/fonts
cp ../table/app/styles/fonts/* ./styles/fonts
git add -A
git commit -m "deploy"
git push
echo "Done deploying!"
