import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
};

export const redisPublisher = new Redis(redisConfig);
export const redisSubscriber = new Redis(redisConfig);

// Event handlers for publisher
redisPublisher.on('connect', () => {
  console.log('✅ Redis Publisher connected');
});

redisPublisher.on('error', (err) => {
  console.error('❌ Redis Publisher Error:', err);
});

// Event handlers for subscriber
redisSubscriber.on('connect', () => {
  console.log('✅ Redis Subscriber connected');
});

redisSubscriber.on('error', (err) => {
  console.error('❌ Redis Subscriber Error:', err);
});

redisSubscriber.on('end', () => {
  console.log('🔌 Redis Subscriber connection ended');
});

// Graceful shutdown
process.on('SIGINT', () => {
  redisPublisher.disconnect();
  redisSubscriber.disconnect();
  console.log('🔌 Redis connections closed');
});

export default { redisPublisher, redisSubscriber }; 