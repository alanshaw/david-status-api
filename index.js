import express from 'express'
import compress from 'compression'
import { RedisCache, MemoryCache } from './cache.js'
import { cors } from './middleware.js'
import { ProjApi } from './client/project-api.js'
import { InfoApi } from './client/info-api.js'
import { StatusBase } from './statusbase.js'

export async function start (config) {
  if (!config) throw new Error('missing config')
  const cache = config.cache?.type === 'redis' ? new RedisCache(config.cache) : new MemoryCache(config.cache)
  if (cache instanceof MemoryCache) console.warn('🚨 Using in memory cache')
  const infoApi = new InfoApi({ url: config.infoApiUrl })
  console.log(`Using Info API at ${config.infoApiUrl}`)
  const projApi = new ProjApi({ url: config.projApiUrl })
  console.log(`Using Project API at ${config.projApiUrl}`)
  const statusBase = new StatusBase({ projApi, infoApi, cache })

  const app = express()

  app.use(compress())
  app.use(cors)

  app.get('/:service/:owner/:repo.svg', async (req, res) => {
    const { service, owner, repo } = req.params
    const { type, ref, path, style } = req.query
    let file
    try {
      const { status } = await statusBase.get(service, owner, repo, { type, ref, path })
      file = badgePath(status, { type, style })
    } catch (err) {
      console.error(err)
      res.status(500)
      file = badgePath('unknown', { type, style })
    }
    res.sendFile(file)
  })

  app.get('/:service/:owner/:repo', async (req, res) => {
    const { service, owner, repo } = req.params
    const { type, ref, path } = req.query
    const status = await statusBase.get(service, owner, repo, { type, ref, path })
    res.json(status)
  })

  return new Promise(resolve => {
    const server = app.listen(config.port, () => {
      console.log(`Status API listening at http://localhost:${server.address().port}`)
      resolve(server)
    })
  })
}

function badgePath (status, opts) {
  opts = opts ?? {}
  const type = opts.type ? opts.type + '-' : ''
  const style = opts.style === 'flat-square' ? '-flat-square' : ''
  return new URL(`images/${type}${status}${style}.svg`, import.meta.url).toString().slice(7)
}
