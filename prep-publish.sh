read -p "you sure? (y/*) " shouldContinue
if [ "$shouldContinue" != "y" ]; then
	exit
fi

tsc
cp -r dist/ distribution/
cp LICENSE distribution/LICENSE
cp README.md distribution/README.md
cp package.json distribution/package.json