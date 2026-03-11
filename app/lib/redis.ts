import { UserInclude, UserModel } from '@/prisma/app/generated/prisma/models';
import { randomUUID } from 'crypto';
import redis, { RedisClientType } from 'redis';
import { prisma } from './prisma';
import { DefaultArgs } from '@prisma/client/runtime/client';

const globalForRedis = global as unknown as { redis: RedisClientType };

export const redisClient = globalForRedis.redis || redis.createClient({
    url: process.env.REDIS_URL
});

if (!redisClient.isOpen) {
    redisClient.connect();
}

redisClient.on('connect', () => {
    console.log('Redis conectando...')
  })
  
  redisClient.on('ready', () => {
    console.log('Redis pronto para comandos')
  })
  
  redisClient.on('error', (err) => {
    console.error('Redis error:', err)
  })
  

if (process.env.NODE_ENV !== "production")
    globalForRedis.redis = redisClient;

export const createSession = async (user: UserModel) => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
    
    const sessionId = randomUUID()

    const expiresInSeconds = 60 * 60 * 24 * 7 // 7 dias

    await redisClient.set(
        `session:${sessionId}`,
        user.id,
        { EX: expiresInSeconds }
    )

    return sessionId
}

export const getSession = async (sessionId: string, userInclude?: UserInclude<DefaultArgs>) => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }

    const userId = await redisClient.get(`session:${sessionId}`);

    if(!userId)
        throw new Error('User id não está definido')

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        },
        include: {
            ...(userInclude ? userInclude : {})
        }
    });

    return user;
} 