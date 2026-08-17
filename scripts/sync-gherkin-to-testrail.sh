#!/usr/bin/env bash
# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2

set -euo pipefail

# TestRail configuration is provided through GitLab CI/CD environment variables.
: "${TESTRAIL_URL:?TESTRAIL_URL is not set}"
: "${TESTRAIL_PROJECT:?TESTRAIL_PROJECT is not set}"
: "${TESTRAIL_PROJECT_ID:?TESTRAIL_PROJECT_ID is not set}"
: "${TESTRAIL_SUITE_ID:?TESTRAIL_SUITE_ID is not set}"
: "${TESTRAIL_SECTION_ID:?TESTRAIL_SECTION_ID is not set}"
: "${FEATURES_DIR:?FEATURES_DIR is not set}"
: "${TESTRAIL_USERNAME:?TESTRAIL_USERNAME is not set}"
: "${TESTRAIL_API_KEY:?TESTRAIL_API_KEY is not set}"

# TODO: Implement pagination for TestRail case retrieval.
# The TestRail get_cases API returns a maximum of 250 cases per request by default.
# This script currently fetches cases with a single API request and does not handle pagination.
# See issue: https://git.opentalk.dev/opentalk/qa/e2e-tests/-/work_items/84 for implementing pagination using the offset and limit parameters:

# Fetch all existing TestRail cases from the project and suite.
TEST_CASES_JSON=$(
  curl -sSf \
    -u "$TESTRAIL_USERNAME:$TESTRAIL_API_KEY" \
    "$TESTRAIL_URL/index.php?/api/v2/get_cases/$TESTRAIL_PROJECT_ID&suite_id=$TESTRAIL_SUITE_ID"
)

# Process all Gherkin feature files.
while IFS= read -r FEATURE_FILE; do

  # Extract the Feature name from the Gherkin file.
  FEATURE_NAME=$(
    sed -n 's/^[[:space:]]*Feature:[[:space:]]*//p' "$FEATURE_FILE" |
    head -n 1
  )

  if [[ -z "$FEATURE_NAME" ]]; then
    echo "Skipping: No Feature name found in $FEATURE_FILE"
    continue
  fi

  # Find an existing TestRail case by matching its title
  # with the Gherkin Feature name.
  TEST_CASE_ID=$(
    echo "$TEST_CASES_JSON" |
    jq -r --arg name "$FEATURE_NAME" '
      .cases[]
      | select(.title == $name)
      | .id
    ' |
    head -n 1
  )

  # Create a temporary copy without SPDX comments because
  # they are not accepted by the TestRail Gherkin importer.
  TEMP_FEATURE_FILE=$(mktemp)

  sed \
    -e '/^# SPDX-FileCopyrightText:/d' \
    -e '/^# SPDX-License-Identifier:/d' \
    -e '/^#[[:space:]]*$/d' \
    "$FEATURE_FILE" > "$TEMP_FEATURE_FILE"

  if [[ -n "$TEST_CASE_ID" ]]; then

    echo "Updating: $FEATURE_NAME"

    trcli -y \
      -h "$TESTRAIL_URL" \
      -u "$TESTRAIL_USERNAME" \
      -k "$TESTRAIL_API_KEY" \
      --project "$TESTRAIL_PROJECT" \
      import_gherkin \
      -f "$TEMP_FEATURE_FILE" \
      --case-id "$TEST_CASE_ID" \
      --update

  else

    # No TestRail case with the same Feature name exists.
    # Import the Gherkin feature as a new TestRail case in the TestRail section.
    echo "Creating: $FEATURE_NAME"

    trcli -y \
      -h "$TESTRAIL_URL" \
      -u "$TESTRAIL_USERNAME" \
      -k "$TESTRAIL_API_KEY" \
      --project "$TESTRAIL_PROJECT" \
      import_gherkin \
      -f "$TEMP_FEATURE_FILE" \
      --section-id "$TESTRAIL_SECTION_ID"

  fi

  # Remove the temporary file after the import/update is complete.
  rm -f "$TEMP_FEATURE_FILE"

done < <(find "$FEATURES_DIR" -type f -name "*.feature" | sort)