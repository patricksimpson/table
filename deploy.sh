#!/bin/zsh
echo "building production"
cake build
echo "moving files to deploy directory..."
cd ../table-deploy
ls -1 | xargs rm -rf
mv ../table/public/* .
echo "thetable.io" > CNAME
git add -A
git commit -m "deploy"
git push
cd ../table
echo "Done deploying!"
