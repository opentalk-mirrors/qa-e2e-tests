#!/bin/bash
# SPDX-FileCopyrightText: OpenTalk GmbH <mail@opentalk.eu>
#
# SPDX-License-Identifier: EUPL-1.2

WEBAPP_BASE=$1
TIMEOUT=$2
counter=0;
while [ "$(curl "$WEBAPP_BASE"/manifest.json -k | grep '"short_name": "OpenTalk"' -q; echo $?)" -ne 0 ];
do
  (( counter++ )) || true
  if [ $counter -gt "$TIMEOUT" ]; then
    echo "timeout waiting for webapp to start"
    exit 1
  fi;
  sleep 1;
done
