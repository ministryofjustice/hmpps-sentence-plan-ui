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
    - A debugger session will be accessible on http://localhost:9230
    - To check the health status, go to http://localhost:3000/health
2. The application will live-reload as you make changes to the code.

> **Note:** Each time you change or update your node dependencies, run `make install-node-modules` to have these reflected in your Docker container.

You can connect to the remote debugger session on http://localhost:9230 like so
[![API docs](https://github.com/ministryofjustice/hmpps-strengths-based-needs-assessments-ui/blob/main/.readme/debugger.png?raw=true)]()

### Linting

Linting can be run using `make lint` and `make lint-fix`

### Testing

The test suite can be run using `make test`.

For integration tests which rely on a user authenticating via HMPPS Auth, use the `AUTH_ADM` user account which is pre-configured in the hmpps-auth Docker container.

### Visual Regression Testing

Visual Regression Testing (VRT) is run during CI builds in GitHub Actions. Tests that fail will store image snapshots as a zipped artifact within the `visual_regression_test` jobs and can be accessed through the relevant Github Action workflow run.

The baseline images which are used as a comparison against the running application are stored in `cypress-image-diff-screenshots/baseline`. New baseline images must be generated through a failing CI run rather than locally since they must use the resolution, PPI, browser version and font rendering that the application uses when the VRT runs in CI.

You can then download the artifact to add or overwrite the existing baseline images with the new ones.

#### Comparing failed snapshots locally

In order to compare CI failed snapshots locally, you will need to download the artifacts for each matrix container of visual regression testing.

These will need to be added to the respective `comparison` and `diff` folders underneath `cypress-image-diff-screenshots/`.

The pipeline will also create a `cypress-image-diff.json` file for failed image diffs, which you will need to download and use to overwrite your local version within `cypress-image-diff-html-report/`.

You can then run `make vrt` and visit http://127.0.0.1:6868/ in a browser to see the visual diff report.

#### Running VRT locally

VRT can be run locally using `make vrt`, but will fail by default due to font rendering issues. If you want to run these tests locally you will need to generate new local-specific baseline images. To do this:

1. run `make vrt`
2. visit http://127.0.0.1:6868/ in a browser
3. click the green "Update" button for each baseline image you want to update to match your local version

This can be helpful when making significant UI changes, and it's recommended that if you take this approach you generate your local baseline images when running on the `main` branch.