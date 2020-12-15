# status-api

Project and Info API aggregator and badger server.

## API

### `GET /:service/:owner/:repo?path=&ref=&type=`

Path params:

* `:service` - the service hosting the repo that contains the `package.json`. Currently only GitHub is supported ("gh").
* `:owner` - user or organisation name that owns the repo.
* `:repo` - repository name where the `package.json` lives.

Query params:

* `path` - path to the `package.json` file from the root of the repo (if not at root).
* `ref` - commitish or branch/tag name.
* `type` - specify "dev"/"peer" etc. to specify fetching status for `devDependencies`/`peerDependencies` etc. instead of regular `dependencies`.

Response:

Same as the repsonse from the info API:

```js
{
  status: string, // uptodate, outofdate, notsouptodate, none
  deps: Array<{
    name: string,
    required: string, // semver range from input
    stable: string, // semver version
    latest: string, // semver version
    status: string, // uptodate, outofdate
    pinned: boolean
  }>
  totals: {
    upToDate: number,
    outOfDate: number,
    pinned: {
      upToDate: number,
      outOfDate: number
    },
    unpinned: {
      upToDate: number,
      outOfDate: number
    }
  }
}
```

### `GET /:service/:owner/:repo.svg?path=&ref=&style=&type=`

Path params:

* `:service` - the service hosting the repo that contains the `package.json`. Currently only GitHub is supported ("gh").
* `:owner` - user or organisation name that owns the repo.
* `:repo` - repository name where the `package.json` lives.

Query params:

* `path` - path to the `package.json` file from the root of the repo (if not at root).
* `ref` - commitish or branch/tag name.
* `style` - specify "flat-square" for squared images.
* `type` - specify "dev"/"peer" etc. to specify fetching status for `devDependencies`/`peerDependencies` etc. instead of regular `dependencies`.

Response:

SVG status badge.
