import rc from 'rc'

const MINUTE = 1000 * 60
const HOUR = MINUTE * 60

export default rc('status-api', {
  port: 3002,
  infoApiUrl: 'http://localhost:3000',
  projApiUrl: 'http://localhost:3001',
  cache: {
    type: 'memory', // also 'redis' + add additional redis prop for config
    maxAge: HOUR
  }
})
