import redis from 'redis';

const client = redis.createClient({
    url: 'redis://127.0.0.1:6379' // Using the URL format instead of separate host and port
  });
  

client.on('connect', () => {
  console.log('Client connected to redis...')
})

client.on('ready', () => {
  console.log('Client connected to redis and ready to use...')
})

client.on('error', (err) => {
  console.log(err.message)
})

client.on('end', () => {
  console.log('Client disconnected from redis')
})

process.on('SIGINT', () => {
  client.quit()
})

export default client;