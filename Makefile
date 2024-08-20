install:
	npm ci
build:
	npx webpack
develop:
	npx webpack serve
lint:
	npx eslint .

