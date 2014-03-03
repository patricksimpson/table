#!/bin/zsh
cake build
git checkout gh-pages
ls -1 | grep -v public | grep -v node_modules | grep -v deploy.sh | xargs rm -rf
mv public/* .
git add -A
git commit -m -a "deploy"
git push
echo "Done deploying!"
