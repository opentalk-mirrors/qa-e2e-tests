# Home of our E2E-Tests :exclamation: currently under construction :exclamation:

Start a new [pipeline](https://git.opentalk.dev/opentalk/qa/e2e-tests/-/pipelines/new) and define the image tags to be tested.

## Setup a local testing enviroment

Start all needed containers:
```
docker compose up -d
```

Immediately after starting the container, the tests may fail because some OpenTalk components take some time to start.
You can access the webapp via http://localhost:3000.

Run a test suite:
```
docker compose exec test-runner npx playwright test --project=chromium
```

Visit last test reports:
```
docker compose exec test-runner npx playwright show-report
```

Update containers to the newest versions:
```
docker compose pull && docker compose up -d
```
