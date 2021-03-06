# PINGR

The below shows how to get the development system up and running. Further documentation is available:

- [Setting up the Windows DB server](../master/docs/DB_DEPLOYMENT.md)
- [Our current git workflow](../master/docs/GIT_WORKFLOW.md)

## Prerequisites

1. MongoDB
  * PINGR requires v3.4.x
  * Instructions for installing MongoDB can be found here: https://docs.mongodb.com/manual/administration/install-community/

2. Node.js
  * PINGR currently uses node v8.x.x
  * nvm is recommended for managing multiple versions on node on your system

 
## Installation

1. Clone the repository

```
$ git clone https://github.com/rw251/pingr
```

2. Set up your environment

  * Copy the file .env.dist to .env 
  * Populate the .env file with the appropriate settings


3. Build

```
$ npm install 
```	

## Running PINGR

To start PINGR on a development system:

```
$ npm start
```

You can also debug the backend by calling:

```
$ npm run debug 
```

And point your Chrome DevTools Protocol enabled browser to:

```
chrome://inspect
```

