import { piggyback } from 'piggybacker'

/**
 * key generates a key for the given params.
 * @param {string} service Name of the service providing access to the git repo. e.g. "gh".
 * @param {string} owner User or organization name.
 * @param {string} repo Repository name.
 * @param {object} [opts]
 * @param {string} [opts.type]
 * @param {string} [opts.path]
 * @param {string} [opts.ref]
 * @returns {string}
 */
function key (service, owner, repo, opts) {
  let { type, path, ref } = opts ?? {}
  let key = `${service}/${owner}/${repo}`
  if (path) {
    if (path[path.length - 1] === '/') {
      path = path.slice(0, -1)
    }
    key = `${key}/${path}`
  }
  key = type ? `${key}?${type}` : key
  return ref ? `${key}#${ref}` : key
}

export class StatusBase {
  constructor ({ projApi, infoApi, cache }) {
    this._projApi = projApi
    this._infoApi = infoApi
    this._cache = cache
    this.get = piggyback(this.get.bind(this), key)
  }

  /**
   * get retrieves status info for the passed service/owner/repo.
   * @param {string} service Shortname for public service providing access to the git repo. e.g. "gh".
   * @param {string} owner User or organization name.
   * @param {string} repo Repository name.
   * @param {object} [opts]
   * @param {string} [opts.type] Type of dependencies to get "dev"/"peer" or nully for regular deps.
   * @param {string} [opts.path] Path from the root of the repo to the dir of the package.json.
   * @param {string} [opts.ref] Name of the commit/branch/tag.
   * @returns {Promise<any>}
   */
  async get (service, owner, repo, opts) {
    const { type } = opts ?? {}
    if (type && type !== 'dev' && type !== 'peer' && type !== 'optional') {
      throw new Error('invalid dependency type')
    }

    const cacheKey = key(service, owner, repo, opts)

    let status = await this._cache.get(cacheKey)
    if (status) {
      console.log('Cache hit', cacheKey)
      return status
    }

    const pkg = await this._projApi.get(service, owner, repo, opts)
    const deps = pkg?.[type ?? 'dependencies']
    const info = await (this._infoApi.get(deps))
    status = info // IDK maybe we want to augment with info about where this data came from?

    console.log(`Got status for ${cacheKey}: ${info.status}`)
    await this._cache.set(cacheKey, status)
    return status
  }
}
