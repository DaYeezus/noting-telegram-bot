// redis client class base configuration and export connected redis client to use outside of application
import {createClient, RedisClientType} from 'redis';

class RedisClient {
    private readonly client: RedisClientType;

    constructor() {
        this.client = createClient({
            url: process.env.REDIS_URL
        });
    }

    public getClient(): RedisClientType {
        return this.client;
    }
}

export const redisClient = new RedisClient().getClient();
