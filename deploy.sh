#!/usr/bin/env bash

#set -x

# Parameters

BRANCH_NAME=$TRAVIS_BRANCH
DEST_DIR="s3://$AWS_BUCKET/$AWS_SUBFOLDER/$BRANCH_NAME"
ASSET_URL="http://static.gapminderdev.org/vizabi/master/"
BUILD_CMD="npm run build"

# =================================================
# DEPLOY TO S3

# Generate S3 configuration file
echo "[default]
access_key = $AWS_ACCESS_KEY_ID
secret_key = $AWS_SECRET_KEY
acl_public = True" > /tmp/.$AWS_BUCKET-s3.s3cfg

# Upload to S3
s3cmd -v --config=/tmp/.$AWS_BUCKET-s3.s3cfg --acl-public --recursive --no-mime-magic --guess-mime-type sync build/ "$DEST_DIR/"

rm -rf /.tmp
