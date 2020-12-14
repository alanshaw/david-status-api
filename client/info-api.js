import bent from 'bent'

export class InfoApi {
  constructor ({ url }) {
    this._fetch = bent('POST', url, 200, 'json')
  }

  get (deps) {
    return this._fetch('/', deps)
  }
}
