set -euo pipefail

GH_PAGES_BUILD=1
export GH_PAGES_BUILD

rm -rf .gh-pages-build
yarn build:ghPages
cd .gh-pages-build

git init
git remote add origin git@github.com:shlomiassaf/pebula-node.git
git add .
git commit -m "update"
git branch gh-pages
git push --set-upstream origin gh-pages -f
