SHELL = '/bin/bash'
DEV_COMPOSE_FILES = -f docker/docker-compose.yml -f docker/docker-compose.local.yml -f docker/docker-compose.dev.yml
LOCAL_COMPOSE_FILES = -f docker/docker-compose.yml -f docker/docker-compose.local.yml
TEST_COMPOSE_FILES = -f docker/docker-compose.yml -f docker/docker-compose.test.yml
PROJECT_NAME = hmpps-assess-risks-and-needs

export COMPOSE_PROJECT_NAME=${PROJECT_NAME}

default: help

help: ## The help text you're reading.
	@grep --no-filename -E '^[0-9a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

up: ## Starts/restarts the UI in a production container.
	docker compose ${LOCAL_COMPOSE_FILES} down sp-ui
	docker compose ${LOCAL_COMPOSE_FILES} up sp-ui --wait --no-recreate

down: ## Stops and removes all containers in the project.
	docker compose ${LOCAL_COMPOSE_FILES} down
	make dev-down
	make test-down

build-ui: ## Builds a production image of the UI.
	docker compose ${LOCAL_COMPOSE_FILES} build sp-ui

dev-up: ## Starts/restarts the UI in a development container. A remote debugger can be attached on port 9229.
	@make install-node-modules
	docker compose ${DEV_COMPOSE_FILES} down sp-ui
	docker compose ${DEV_COMPOSE_FILES} up sp-ui --wait --no-recreate

dev-build: ## Builds a development image of the UI and installs Node dependencies.
	@make install-node-modules
	docker compose ${DEV_COMPOSE_FILES} build sp-ui

dev-down: ## Stops and removes all dev containers.
	docker compose ${DEV_COMPOSE_FILES} down

test: ## Runs the unit test suite.
	@make install-node-modules
	docker compose ${DEV_COMPOSE_FILES} run --rm --no-deps sp-ui npm run test

BASE_URL ?= "http://localhost:3001"
vrt: ## Run the snapshot Visual Regression Tests UI; this allows for snapshots to be visually compared.
	npx cypress-image-diff-html-report start

e2e: ## Run the end-to-end tests locally in the Cypress app. Override the default base URL with BASE_URL=...
	@make install-node-modules
	docker compose ${DEV_COMPOSE_FILES} up --quiet-pull --no-recreate --wait
	npx cypress install
	npx cypress open --e2e -c baseUrl=${BASE_URL},experimentalInteractiveRunEvents=true

BASE_URL_CI ?= "http://sp-ui:3000"
vrt-ci: ## Run the snapshot Visual Regression Tests in headless mode. Used in CI. Override the default base URL with BASE_URL_CI=...
	docker compose ${TEST_COMPOSE_FILES} -p ${PROJECT_NAME}-test run --quiet-pull --rm -e CYPRESS_BASE_URL=${BASE_URL_CI} -e SPEC="integration_tests/e2e/vrt-tests/**/*.cy.ts" -e SPLIT=${SPLIT} -e SPLIT_INDEX=${SPLIT_INDEX} cypress --env split=true run --spec 'integration_tests/e2e/vrt-tests/**/*.cy.ts'

e2e-ci: ## Run the end-to-end tests in parallel in a headless browser. Used in CI. Override the default base URL with BASE_URL_CI=...
	docker compose ${TEST_COMPOSE_FILES} -p ${PROJECT_NAME}-test run --quiet-pull --rm -e CYPRESS_BASE_URL=${BASE_URL_CI} -e SPEC="integration_tests/e2e/e2e-tests/**/*.cy.ts" -e SPLIT=${SPLIT} -e SPLIT_INDEX=${SPLIT_INDEX} cypress --browser edge --env split=true run --spec 'integration_tests/e2e/e2e-tests/**/*.cy.ts'

test-up: ## Stands up a test environment.
	docker compose --progress plain ${LOCAL_COMPOSE_FILES} pull --quiet --policy missing
	docker compose --progress plain ${TEST_COMPOSE_FILES} -p ${PROJECT_NAME}-test up sp-ui --quiet-pull --wait --force-recreate

test-down: ## Stops and removes all of the test containers.
	docker compose --progress plain ${TEST_COMPOSE_FILES} -p ${PROJECT_NAME}-test down

lint: ## Runs the linter.
	docker compose ${DEV_COMPOSE_FILES} run --rm --no-deps sp-ui npm run lint

lint-fix: ## Automatically fixes linting issues.
	docker compose ${DEV_COMPOSE_FILES} run --rm --no-deps sp-ui npm run lint-fix

install-node-modules: ## Installs Node modules into the Docker volume.
	@echo "Running npm install locally..."
	@npm i
	@docker run --rm \
	  -e CYPRESS_INSTALL_BINARY=0 \
	  -v ./package.json:/package.json \
	  -v ./package-lock.json:/package-lock.json \
	  -v ~/.npm:/npm_cache \
	  -v ${PROJECT_NAME}_node_modules:/node_modules \
	  node:22.13-bookworm-slim \
	  /bin/bash -c 'if [ ! -f /node_modules/.last-updated ] || [ /package.json -nt /node_modules/.last-updated ]; then \
	    echo "Running npm ci as container node_modules is outdated or missing."; \
	    npm ci --cache /npm_cache --prefer-offline; \
	    touch /node_modules/.last-updated; \
	  else \
	    echo "Container node_modules is up-to-date."; \
	  fi'

clean: ## Stops and removes all project containers. Deletes local build/cache directories.
	docker compose down
	docker volume ls -qf "dangling=true" | xargs -r docker volume rm
	rm -rf dist node_modules test_results

update: ## Downloads the latest versions of container images.
	docker compose ${LOCAL_COMPOSE_FILES} pull

save-logs: ## Saves docker container logs in a directory defined by OUTPUT_LOGS_DIR=
	docker system info
	mkdir -p ${OUTPUT_LOGS_DIR}
	docker logs ${PROJECT_NAME}-sp-api-1 > ${OUTPUT_LOGS_DIR}/sp-api.log
	docker logs ${PROJECT_NAME}-sp-ui-1 > ${OUTPUT_LOGS_DIR}/sp-ui.log
	docker logs ${PROJECT_NAME}-arns-handover-1 > ${OUTPUT_LOGS_DIR}/arns-handover.log
	docker logs ${PROJECT_NAME}-coordinator-api-1 > ${OUTPUT_LOGS_DIR}/coordinator-api.log
	docker logs ${PROJECT_NAME}-hmpps-auth-1 > ${OUTPUT_LOGS_DIR}/hmpps-auth.log
