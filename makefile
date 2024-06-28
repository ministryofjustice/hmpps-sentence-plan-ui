SHELL = '/bin/bash'
PROJECT_NAME = hmpps-sentence-plan
DEV_COMPOSE_FILES = -f docker/docker-compose.yml -f docker/docker-compose.dev.yml
TEST_COMPOSE_FILES = -f docker/docker-compose.yml -f docker/docker-compose.test.yml
LOCAL_COMPOSE_FILES = -f docker/docker-compose.yml
export COMPOSE_PROJECT_NAME=${PROJECT_NAME}

default: help

help: ## The help text you're reading.
	@grep --no-filename -E '^[0-9a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

up: ## Starts/restarts the UI in a production container.
	docker compose ${LOCAL_COMPOSE_FILES} down ui
	docker compose ${LOCAL_COMPOSE_FILES} up ui --wait --no-recreate

down: ## Stops and removes all containers in the project.
	docker compose ${LOCAL_COMPOSE_FILES} down
	make dev-down
	make test-down

build-ui: ## Builds a production image of the UI.
	docker compose build ui

dev-up: ## Starts/restarts the UI in a development container. A remote debugger can be attached on port 9229.
	@make install-node-modules
	docker compose ${DEV_COMPOSE_FILES} down ui
	docker compose ${DEV_COMPOSE_FILES} up ui --wait --no-recreate

dev-build: ## Builds a development image of the UI and installs Node dependencies.
	make install-node-modules
	docker compose ${DEV_COMPOSE_FILES} build ui

dev-down: ## Stops and removes all dev containers.
	docker compose ${DEV_COMPOSE_FILES} down

test: ## Runs the unit test suite.
	@make install-node-modules
	docker compose ${DEV_COMPOSE_FILES} run --rm --no-deps ui npm run test

lint: ## Runs the linter.
	docker compose ${DEV_COMPOSE_FILES} run --rm --no-deps ui npm run lint

lint-fix: ## Automatically fixes linting issues.
	docker compose ${DEV_COMPOSE_FILES} run --rm --no-deps ui npm run lint-fix

install-node-modules: ## Installs Node modules into the Docker volume.
	@docker run --rm \
	  -e CYPRESS_INSTALL_BINARY=0 \
	  -v ./package.json:/package.json \
	  -v ./package-lock.json:/package-lock.json \
	  -v ~/.npm:/npm_cache \
	  -v ${PROJECT_NAME}_node_modules:/node_modules \
	  node:20-bullseye-slim \
	  /bin/bash -c 'if [ ! -f /node_modules/.last-updated ] || [ /package.json -nt /node_modules/.last-updated ]; then \
	    echo "Running npm ci as container node_modules is outdated or missing."; \
	    npm ci --cache /npm_cache --prefer-offline; \
	    touch /node_modules/.last-updated; \
	  else \
	    echo "Container node_modules is up-to-date."; \
	  fi'

clean: ## Stops and removes all project containers. Deletes local build/cache directories.
	docker compose down
	docker volume rm ${PROJECT_NAME}_node_modules
	rm -rf dist node_modules test_results

update: ## Downloads the latest versions of container images.
	docker compose ${DEV_COMPOSE_FILES} pull
