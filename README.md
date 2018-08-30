# ssb-web-resolver

> resolve an ssb-web url

## Usage

```js
var resolve = require('ssb-web-resolver')

var url = '%257OUHcZna%2FwRjbWZuxsDOuYeimiYI82rps56ewppYriE%3D.sha256/index.html'

var components = url.split('/')

resolve(sbot, components, function (err, content) {
  if (err) throw err
  console.log(content)
})
```

outputs

```
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Austin's Site</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="/web/%257OUHcZna%2FwRjbWZuxsDOuYeimiYI82rps56ewppYriE%3D.sha256/bundle.css"/>
  </head>
  <body>
    <div class='main'>
...
```

## API

```js
var resolve = require('ssb-web-resolver')
```

### resolve(sbot, urlComponents, cb)

Recursively resolves a set of SSB url components to raw blob data. Expects the
URL to be URL-encoded.

eg. If the raw URL was
`%7OUHcZna/wRjbWZuxsDOuYeimiYI82rps56ewppYriE=.sha256/index.html`, you would
pass `['%257OUHcZna%2FwRjbWZuxsDOuYeimiYI82rps56ewppYriE%3D.sha256',
'index.html']` into `urlComponents`.

## Install

With [npm](https://npmjs.org/) installed, run

```
$ npm install ssb-web-resolver
```

## License

ISC

