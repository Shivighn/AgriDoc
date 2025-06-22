import {Ratelimit} from '@upstash/ratelimit';
import {Redis} from '@upstash/redis';
import dotenv from 'dotenv';
dotenv.config();

// ratelimit creation for 10 requests per 20sec
const ratelimit = new Ratelimit({
  redis:Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1m'),
});

export default ratelimit;

