import bent from 'bent'

/**
 * urlPath generates a path for the project API url.
 * @param {string} service Name of the service providing access to the git repo. e.g. "gh".
 * @param {string} owner User or organization name.
 * @param {string} repo Repository name.
 * @param {object} [opts]
 * @param {string} [opts.path]
 * @param {string} [opts.ref]
 * @returns {string}
 */
function urlPath (service, owner, repo, opts) {
  const { path, ref } = opts ?? {}
  const p = `/${encodeURIComponent(service)}/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`
  const searchParams = new URLSearchParams()
  if (path) searchParams.set('path', path)
  if (ref) searchParams.set('ref', ref)
  const qs = searchParams.toString()
  return qs ? `${p}?${qs}` : p
}

export class ProjApi {
  constructor ({ url }) {
    this._fetch = bent('GET', url, 200, 'json')
  }

  get (service, owner, repo, opts) {
    return this._fetch(urlPath(service, owner, repo, opts))
  }
}
