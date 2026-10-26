#!/bin/bash
# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2

# checks if keycloak and the webapp are running and are accessible
# expects $OIDC_ISSUER and $INSTANCE_URL to be set as env. variables
# a timeout can be provided as optional parameter (default 60 sec)
# the timeout is reset between each check, so all together can be double of the provided value

if [ -z "$INSTANCE_URL" ]; then
  echo "Error: INSTANCE_URL variable is not set."
  exit 1
fi

if [ -z "$OIDC_ISSUER" ]; then
  echo "Error: OIDC_ISSUER variable is not set."
  exit 1
fi

if [ -z "$CONTROLLER_HOST" ]; then
  echo "Error: CONTROLLER_HOST variable is not set."
  exit 1
fi

if [ -z "$LIVEKIT_HOST" ]; then
  echo "Error: LIVEKIT_HOST variable is not set."
  exit 1
fi

WEBAPP_BASE=$INSTANCE_URL

if [ -z "$1" ]; then
  TIMEOUT=60
else
  TIMEOUT=$1
fi

waitForServices() {
  local service_url=$1
  local service_name=$2
  local pattern=$3
  local counter=0

  while [ "$(curl -k "${service_url}" | grep "${pattern}" -q; echo $?)" -ne 0 ];
  do
    (( counter++ )) || true
    if [ $counter -gt "$TIMEOUT" ]; then
      echo "timeout waiting for $service_name to start"
      exit 1
    fi;
    echo "waiting for $service_name to start"
    sleep 1;
  done
}

waitForServices "${OIDC_ISSUER}/.well-known/openid-configuration" keycloak OPENTALK
waitForServices "${WEBAPP_BASE}/manifest.json" webapp '"short_name": "OpenTalk"'
waitForServices "${CONTROLLER_HOST}/v1/auth/login" controller oidc
waitForServices "${LIVEKIT_HOST}" livekit OK
waitForServices "${ETHERPAD_HOST}" etherpad en
