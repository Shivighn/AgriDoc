import ratelimit from '../config/upstash.js';

const rateLimiter = async (req, res, next) => {
  try {
    const{ success} = await ratelimit.limit("my-limit-key");
    if (!success) {
      res.status(429).json({ error: 'Too many requests, please try again later.' });
    }
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(429).json({ error: error.message });
  }
}

export default rateLimiter;
