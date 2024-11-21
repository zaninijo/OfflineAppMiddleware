import express from 'express'
import http from 'http'
import config from './config.cjs'
import { v4 } from 'uuid'
import newChatInstance from './wssChat.js'
import aiReporter from './ai_model/report.js'
import auth from './auth.js'
import { chatCreateLimit, apiLimiter } from './limiter.js'

const { HTTP_PORT } = config

const app = express();
const server = http.createServer(app)

app.use(express.json(), auth) 

app.use('/chat', chatCreateLimit)
app.get('/chat', (req, res) => {
    const chatId = v4();
    const accessKey = v4();

    newChatInstance(server, chatId, accessKey);
    
    res.json({
        chatPath: `ws://${req.get('host')}${req.path}/${chatId}`,
        accessKey: accessKey
    })
})

app.use('/report', apiLimiter)
app.post('/report', (req, res) => {
    const usageData = req.body
    if (!usageData) {
        res.status(400).json({ error: "Sem dados no corpo da requisição." })
    }
    aiReporter(usageData)
    .then(result => {
        res.json({
            result: result.response.candidates[0].content.parts[0].text
        })
    })
    .catch((error) => {
        console.log(error)
        res.status(500).json({ message: "Erro interno no servidor." })
    })
})

app.use('/fastReport', apiLimiter)
app.post('/fastReport', (req, res) => {
    const usageData = req.body
    if (!usageData) {
        res.status(400).json({ error: "Sem dados no corpo da requisição." })
    }
    aiReporter(usageData)
    .then(result => {
        res.json({
            result: result.response.candidates[0].content.parts[0].text
        })
    })
    .catch((error) => {
        console.log(error)
        res.status(500).json({ message: "Erro interno no servidor." })
    })
})

server.listen(HTTP_PORT, () => {    // Divide o mesmo servidor com o express
    console.log(`Gatekeeper está escutando na porta ${HTTP_PORT}`)
})