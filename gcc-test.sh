#!/bin/bash

npm run-script build

mkdir -p test-out

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# run our test suite and check output
for D in ./gcc-test/*; do
    if [ -d "${D}" ]; then
        rm -rf test-out/*

        # build and run
        # TODO: check result of build/gcc?
        node dist/bundle.js $D/main.cpp test-out/out.s
        gcc test-out/out.s -o test-out/out
        ./test-out/out

        # assert
        ACTUAL_OUT=$?
        EXPECTED_OUT=$(cat $D/expected.out)
        if [ $ACTUAL_OUT == $EXPECTED_OUT ]; then
            echo -e "${GREEN}passed: $D${NC}"
        else
            >&2 echo -e "${RED}failed: $D${NC}"
        fi
    fi
done