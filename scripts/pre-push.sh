#!/bin/sh

CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'
BRANCH="$(git rev-parse --abbrev-ref HEAD)"

if [ "$BRANCH" = "main" ]; then
  echo "\n\n${RED}You cannot commit directly to main branch.${NC}"
  echo "${CYAN}If you must, you can add --no-verify at the end${NC}\n\n"
  exit 1
fi
