import rateLimit from "express-rate-limit"
import config from './config.cjs'

const { MAX_REQUESTS, RATE_LIMIT_WINDOW } = config;;
const rateLimitMap = new Map();

export const apiLimiter = rateLimit({ // para outras requisições gerais no express
    windowMs: RATE_LIMIT_WINDOW,
    max: MAX_REQUESTS,
    message: "Você excedeu o limite de requisições permitidas, tente novamente mais tarde.",
    standardHeaders: true,
    legacyHeaders: false
});

export const chatCreateLimit = rateLimit({ // para requisições de criação de chat "/chat"
    windowMs: RATE_LIMIT_WINDOW,
    max: 1,
    message: "Você excedeu o limite de criação de canais, tente novamente mais tarde.",
    standardHeaders: true,
    legacyHeaders: false
});

export const rateLimiter = (key) => { // para requisições direto no servidor HTTP. É um pouco simples mas tá bom.
    const currentTime = Date.now();
    const rateLimitData = rateLimitMap.get(key) || { attempts: 0, timestamp: currentTime};

    if (currentTime - rateLimitData.timestamp > RATE_LIMIT_WINDOW) {
        rateLimitMap.set(key, {attempts: 1, timestamp: currentTime});
        return true;
    }

    if (rateLimitData.attempts < MAX_REQUESTS) {
        rateLimitData.attempts++;
        rateLimitMap.set(key, rateLimitData);
        return true;
    }

    return false;

};