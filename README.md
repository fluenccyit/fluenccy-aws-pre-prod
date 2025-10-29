# Fluenccy

## Getting Started

Follow these steps to get this project up and running locally.

### Prerequisites

Before you start, you have to have the following installed on your computer.

1. You have [Docker](https://docs.docker.com/engine/install/) installed
1. You have [NodeJS](https://nodejs.org/en/) installed
1. You have [Yarn](https://yarnpkg.com/) installed
1. You have run `yarn` from the root of this project

### Run Locally

To run locally, simply run these commands in separate terminals.

```bash
$ yarn dev:server
$ yarn dev:client
```


### Dev/QA Login

email: test@fluenccy.com
pw: password

```bash
$ yarn dev
```
### Migrations

To create migrations files

```bash
$ npm install knex -g
$ knex migrate:make <migration_name>
$ knex migrate:list
$ knex migrate:latest
```