#!/bin/bash

# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2
RETRY=1
if $CI; then
  RETRY=2
fi
NODE_TLS_REJECT_UNAUTHORIZED=0 npx cucumber-js --require-module ts-node/register --require e2e/tests/e2e/cucumberWorld.ts --require e2e/tests/e2e/hooks.ts --require e2e/tests/e2e/steps/**/*.ts --format @cucumber/pretty-formatter --tags "not @skip-on-$BROWSER" --retry $RETRY "$1"
