# Home of our E2E-Tests :exclamation: currently under construction :exclamation:

Start a new [pipeline](https://git.opentalk.dev/opentalk/qa/e2e-tests/-/pipelines/new) and define the image tags to be tested.

## Setup a local testing enviroment

Start all needed containers:
```
docker compose up -d
```

Install testing dependencies:
```
docker compose exec test-runner npm ci
docker compose exec test-runner npx playwright install
```


Run a test suit:
```
docker compose exec test-runner npx playwright test --project=chromium
```

Visit test reports:
```
docker compose exec test-runner npx playwright show-report --host 0.0.0.0
```
