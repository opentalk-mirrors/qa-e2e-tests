#!/usr/bin/env bash
# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2

set -euo pipefail

TESTRAIL_URL="https://opentalk.testrail.io"
TESTRAIL_PROJECT="Cucumber automation tests"
TESTRAIL_PROJECT_ID="17"
TESTRAIL_SUITE_ID="1257"
TESTRAIL_SECTION_ID="8635"
FEATURES_DIR="e2e/tests/e2e/features"

: "${TESTRAIL_USERNAME:?TESTRAIL_USERNAME is not set}"
: "${TESTRAIL_API_KEY:?TESTRAIL_API_KEY is not set}"

CASES_JSON=$(
  curl -sSf \
    -u "$TESTRAIL_USERNAME:$TESTRAIL_API_KEY" \
    "$TESTRAIL_URL/index.php?/api/v2/get_cases/$TESTRAIL_PROJECT_ID&suite_id=$TESTRAIL_SUITE_ID"
)

while IFS= read -r FEATURE_FILE; do

  FEATURE_NAME=$(
    sed -n 's/^[[:space:]]*Feature:[[:space:]]*//p' "$FEATURE_FILE" |
    head -n 1
  )

  if [[ -z "$FEATURE_NAME" ]]; then
    echo "Skipping: No Feature name found in $FEATURE_FILE"
    continue
  fi

  CASE_ID=$(
    echo "$CASES_JSON" |
    jq -r --arg name "$FEATURE_NAME" '
      .cases[]
      | select(.title == $name)
      | .id
    ' |
    head -n 1
  )

  TEMP_FEATURE_FILE=$(mktemp)

  sed \
    -e '/^# SPDX-FileCopyrightText:/d' \
    -e '/^# SPDX-License-Identifier:/d' \
    -e '/^#[[:space:]]*$/d' \
    "$FEATURE_FILE" > "$TEMP_FEATURE_FILE"

  if [[ -n "$CASE_ID" ]]; then

    echo "Updating: $FEATURE_NAME"

    trcli \
      -h "$TESTRAIL_URL" \
      -u "$TESTRAIL_USERNAME" \
      -p "$TESTRAIL_API_KEY" \
      --project "$TESTRAIL_PROJECT" \
      import_gherkin \
      -f "$TEMP_FEATURE_FILE" \
      --case-id "$CASE_ID" \
      --update

  else

    echo "Creating: $FEATURE_NAME"

    trcli \
      -h "$TESTRAIL_URL" \
      -u "$TESTRAIL_USERNAME" \
      -p "$TESTRAIL_API_KEY" \
      --project "$TESTRAIL_PROJECT" \
      import_gherkin \
      -f "$TEMP_FEATURE_FILE" \
      --section-id "$TESTRAIL_SECTION_ID"

  fi

  rm -f "$TEMP_FEATURE_FILE"

done < <(find "$FEATURES_DIR" -type f -name "*.feature" | sort)