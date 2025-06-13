# HMPPS Sentence Plan UI
[![repo standards badge](https://img.shields.io/badge/dynamic/json?color=blue&style=flat&logo=github&label=MoJ%20Compliant&query=%24.result&url=https%3A%2F%2Foperations-engineering-reports.cloud-platform.service.justice.gov.uk%2Fapi%2Fv1%2Fcompliant_public_repositories%2Fhmpps-sentence-plan-ui)](https://operations-engineering-reports.cloud-platform.service.justice.gov.uk/public-github-repositories.html#hmpps-sentence-plan-ui "Link to report")
[![CircleCI](https://circleci.com/gh/ministryofjustice/hmpps-sentence-plan-ui/tree/main.svg?style=svg)](https://circleci.com/gh/ministryofjustice/hmpps-sentence-plan-ui)

This project aims to enhance the current process of creating and managing
sentence plans for individuals on probation or in prison.

## Documentation

There is specific implementation documentation for this project in the [docs](./docs) folder.

Other relevant technical docs are in the relevant Confluence space.

## Pre-requisites
In order to run this project, the following software is required:

- **Make** - A command line interface tool for summerising common function calls
- **Docker** - An open-source application packager for platform agnostic deployable software
- **Node.js** - A JavaScript runtime environment and library for running web based applications

## Running the application

> **Note:**
> - This service and all of its dependencies are run in Docker containers
> - Every command can be printed using `make`
> - Due to requiring authentication through the ARNS Handover Service,
    to access the Sentence Plan UI, you can create a handover through the
    OAStub hosted at http://localhost:7072 and select `Sentence Plan` as the target service.

### Production

> **Note:** Before starting, run `make install-node-modules` to install dependencies.

1. To start a production version of the application, run `make up`
    - The service will start on http://localhost:3000
    - To check the health status, go to http://localhost:3000/health
2. To update all containers, run `make down update up`

### Development
1. To start a development version of the application, run `make dev-up`
    - The service will start on http://localhost:3000
    - A debugger session will be accessible on http://localhost:9229
    - To check the health status, go to http://localhost:3000/health
2. The application will live-reload as you make changes to the code.

> **Note:** Each time you change or update your node dependencies, run `make install-node-modules` to have these reflected in your Docker container.

You can connect to the remote debugger session on http://localhost:9229 like so
[![API docs](https://github.com/ministryofjustice/hmpps-strengths-based-needs-assessments-ui/blob/main/.readme/debugger.png?raw=true)]()

### Testing
The test suite can be run using `make test`

### Visual Regression Testing
Visual Regression Testing for UI snapshot verification can be run using `make vrt-ci`.
To visually inspect these snapshots, verify UI states and update locally, this can be run using `make vrt`.

### Linting
Linting can be run using `make lint` and `make lint-fix`
