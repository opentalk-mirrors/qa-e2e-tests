# Home of our E2E-Tests :bug: :axe:

Start a new [pipeline](https://git.opentalk.dev/opentalk/qa/e2e-tests/-/pipelines/new) and define the image tags to be tested.

## Setup a local testing environment

Start all needed containers:
```
docker compose up -d
```

You can access the webapp via https://localhost:8443.

Update containers to the newest versions:
```
docker compose pull && docker compose up -d
```

Testing on a specific frontend/controller image:

You can provide specific webapp and controller image to run tests on

You can build your own image or you can get images from
- for webapp -> `container` step of pipeline
- for controller -> `package:container-controller-mr` step of pipeline.

```
FRONTEND_TAG=mr_branchname CONTROLLER_TAG=branchname FRONTEND_IMAGE=... CONTROLLER_IMAGE=... docker compose up -d
```

> [!IMPORTANT]  
> If you are using image from a MR that is already closed it won't work because the image is deleted when closed

## Run tests

So far there are tests that are written in vanilla playwright and those that utilize Gherkin.

### Vanilla Playwright Tests

Run a playwright test suite inside a container:
```
docker compose exec test-runner npx playwright test --project=chromium
```

Visit last test reports:
```
docker compose exec test-runner npx playwright show-report
```

### Gherkin Tests
Runs all gherkin tests (default in headless mode):

```
npm run test:all
```

Runs all gherkin tests in headed mode:

```
npm run test:all:headed
```

Runs a specific feature file (default in headless mode):

```
npm run test:feature e2e/tests/e2e/features/myFeature.feature
```

Runs a specific feature file in headed mode:

```
npm run test:feature:headed e2e/tests/e2e/features/myFeature.feature
```

## View traces of CI runs
When a test fail, playwright will create a trace of the first retry (see `trace: 'on-first-retry'` in [playwright.config.ts](https://git.opentalk.dev/opentalk/qa/e2e-tests/blob/main/playwright.config.ts)).  
These traces are a very useful tool to debug failed tests in CI, specially if they pass in the local environment.  
To access the traces of a specific CI run:
1. open the CI job you are interested in
2. find the "Job artifacts" section on the right side
3. download the artifacts
4. unpack the .zip file
5. inside `test-results/e2e-<test title>-<browser>-retry1` you will find a `trace.zip` file
6. run `npx playwright show-trace` with that file e.g. `npx playwright show-trace ~/Downloads/artifacts/test-results/e2e-meetingRoom-meetingRoo-b6281-ing-Room-As-Moderator-Timer-chromium-retry1/trace.zip`  

Alternatively to steps 3 & 4 you can also browse content of the artifacts on git.opentalk.dev and find & download the needed `trace.zip` directly.  

More documentation about the trace viewer can be found in the [playwright docs](https://playwright.dev/docs/trace-viewer#trace-viewer-features).
