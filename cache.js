import redis from 'redis'
import LRUCache from 'lru-cache'
import { promisify } from 'util'

const HOUR = 1000 * 60 * 60

export class RedisCache {
  constructor (config) {
    if (!config) throw new Error('missing config')
    if (!config.redis) throw new Error('missing redis config')
    this._redis = redis.createClient(config.redis)
    this._redis.getAsync = promisify(this._redis.get).bind(this._redis)
    this._redis.setAsync = promisify(this._redis.set).bind(this._redis)
    this._redis.delAsync = promisify(this._redis.del).bind(this._redis)
    this._maxAge = config.maxAge ?? HOUR
  }

  async get (k) {
    const v = JSON.parse(await this._redis.getAsync(k))
    return v
  }

  async set (k, v) {
    await this._redis.setAsync(k, JSON.stringify(v), 'PX', this._maxAge)
  }

  del (k) {
    return this._redis.delAsync(k)
  }
}

export class MemoryCache {
  constructor (config) {
    this._lru = new LRUCache({ maxAge: config?.maxAge ?? HOUR })
  }

  get (k) {
    return this._lru.get(k)
  }

  set (k, v) {
    return this._lru.set(k, v)
  }

  del (k) {
    return this._lru.del(k)
  }
}
