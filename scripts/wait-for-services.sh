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

WEBAPP_BASE=$INSTANCE_URL

if [ -z "$1" ]; then
  TIMEOUT=60
else
  TIMEOUT=$1
fi

counter=0;

while [ "$(curl "$OIDC_ISSUER"/.well-known/openid-configuration -k | grep 'OPENTALK' -q; echo $?)" -ne 0 ];
do
  (( counter++ )) || true
  if [ $counter -gt "$TIMEOUT" ]; then
    echo "timeout waiting for keycloak to start"
    exit 1
  fi;
  echo "waiting for keycloak to start"
  sleep 1;
done

counter=0;

while [ "$(curl "$WEBAPP_BASE"/manifest.json -k | grep '"short_name": "OpenTalk"' -q; echo $?)" -ne 0 ];
do
  (( counter++ )) || true
  if [ $counter -gt "$TIMEOUT" ]; then
    echo "timeout waiting for webapp to start"
    exit 1
  fi;
  echo "waiting for webapp to start"
  sleep 1;
done

while [ "$(curl "$CONTROLLER_HOST"/v1/auth/login -k | grep 'oidc' -q; echo $?)" -ne 0 ];
do
  (( counter++ )) || true
  if [ $counter -gt "$TIMEOUT" ]; then
    echo "timeout waiting for controller to start"
    exit 1
  fi;
  echo "waiting for controller to start"
  sleep 1;
done