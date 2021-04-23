# Getting Started

## Setup server-config.json

When running own synapse instance - use the same registration_shared_secret (configurable via SYNAPSE_REGISTRATION_SHARED_SECRET) - enable registration (configurable via SYNAPSE_ENABLE_REGISTRATION=true) - rate limits should also be updated, not sure how yet - there is Ratelimiting in homeserver.yaml withoutway of overwriting it.

## Setup users.json

Add as many users as you'd like. There can be one admin in this setup. The admin needs to be registered prior to this.

If we have cloned the Synapse repo we can:
`python register_new_matrix_user.py -u ct-admin -p ct-admin-pass -a -k "SHARED_SECRET" http://localhost:8008`

## Documentation

The base api can be found here [here](http://matrix-org.github.io/matrix-js-sdk/0.11.1/module-base-apis-MatrixBaseApis.html)

# Running the app

_Make sure you've started the Matrix homeserver on port 8008_

`yarn install` & `yarn start`
