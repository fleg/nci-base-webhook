# nci-base-webhook
[![Build Status](https://travis-ci.org/fleg/nci-base-webhook.svg?branch=master)](https://travis-ci.org/fleg/nci-base-webhook)

base class for [nci](https://github.com/node-ci/nci webhook plugins


## Installation

```sh
npm install nci-base-webhook
```

## Usage

This module exports `BaseWebhook` class. Inherit and implement `check(req, project)` method.

Look at [nci-github-webhook](https://github.com/fleg/nci-shields) as example.

## License

[The MIT License](https://raw.githubusercontent.com/fleg/nci-base-webhook/master/LICENSE)
