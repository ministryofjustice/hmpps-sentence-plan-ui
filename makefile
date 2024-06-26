SHELL = '/bin/bash'
REQUIRED_PACKAGES := mutagen mutagen-compose
PROJECT_NAME = hmpps-sentence-plan-ui
DEV_COMPOSE_FILES = -f docker/docker-compose.yml -f docker/docker-compose.dev.yml
TEST_COMPOSE_FILES = -f docker/docker-compose.yml -f docker/docker-compose.test.yml
LOCAL_COMPOSE_FILES = -f docker/docker-compose.yml
export COMPOSE_PROJECT_NAME=${PROJECT_NAME}

default: help

help: ## The help text you're reading.
	@grep --no-filename -E '^[0-9a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install_requirements: ## Install any missing required packages outlined in REQUIRED_PACKAGES=
	@for package in $(REQUIRED_PACKAGES); do \
		if ! command -v brew &> /dev/null; then \
			echo "Homebrew is not installed. Please install Homebrew first."; \
			exit 1; \
		fi; \
		if brew list --formula | grep -q "^$${package}$$"; then \
			echo "Package '$${package}' is installed."; \
		else \
			echo "Package '$${package}' is not installed, installing..."; \
			brew install $${package}; \
		fi; \
	done

install_node_modules: ## Installs Node modules into the Docker volume.
	docker run --rm \
      -e CYPRESS_INSTALL_BINARY=0 \
	  -v ./package.json:/app/package.json \
	  -v ./package-lock.json:/app/package-lock.json \
	  -v ~/.npm:/npm_cache \
	  -v ${PROJECT_NAME}_node_modules_volume:/app/node_modules \
	  node:20-bullseye-slim sh -c "cd /app && npm ci --cache /npm_cache --prefer-offline"

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
	docker compose ${DEV_COMPOSE_FILES} down ui
	mutagen-compose ${DEV_COMPOSE_FILES} up ui --wait --no-recreate

dev-build: ## Builds a development image of the UI and installs Node dependencies.
	mutagen-compose ${DEV_COMPOSE_FILES} build ui
	mutagen-compose ${DEV_COMPOSE_FILES} run --rm --no-deps ui npm install --include=dev

dev-down: ## Stops and removes all dev containers.
	mutagen-compose ${DEV_COMPOSE_FILES} down

test: ## Runs the unit test suite.
	mutagen-compose ${DEV_COMPOSE_FILES} run --rm --no-deps ui npm run test

lint: ## Runs the linter.
	mutagen-compose ${DEV_COMPOSE_FILES} run --rm --no-deps ui npm run lint

lint-fix: ## Automatically fixes linting issues.
	mutagen-compose ${DEV_COMPOSE_FILES} run --rm --no-deps ui npm run lint:fix

install-node-modules: ## Installs Node modules locally and into the Docker volume.
	docker run --rm \
      -e CYPRESS_INSTALL_BINARY=0 \
	  -v ./package.json:/app/package.json \
	  -v ./package-lock.json:/app/package-lock.json \
	  -v ~/.npm:/npm_cache \
	  -v ${PROJECT_NAME}_node_modules_volume:/app/node_modules \
	  node:20-bullseye-slim sh -c "cd /app && npm ci --cache /npm_cache --prefer-offline"

clean: ## Stops and removes all project containers. Deletes local build/cache directories.
	docker compose down
	rm -rf dist node_modules test_results

update: ## Downloads the latest versions of container images.
	docker compose ${DEV_COMPOSE_FILES} pull
