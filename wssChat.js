import { WebSocketServer } from "ws"
import http from 'http'
import createChatSession from './ai_model/chat.js'
import config from "./config.cjs"
import { rateLimiter } from "./limiter.js"

const { WS_TIMEOUT_DURATION } = config

const webSocketServers = {}

/**
 * @param {http.Server} httpServer
 * @param {string} chatId
 * @param {string} accessKey
 */
export default async (httpServer, chatId, accessKey) => {
    const wss = new WebSocketServer({ noServer: true });

    const chatSession = await createChatSession();
    webSocketServers[chatId] = { wss, accessKey };

    console.log(`Iniciando canal ${chatId}`);

    const timeout = setTimeout(() => {
        const client = wss.clients[0];
        if (client) {
            const closureMessage = {
                type: "message",
                content: "O chat se encerrou por conta de inatividade."
            };
            client.send(JSON.stringify(closureMessage));
            client.close();
        }
        console.log(`${chatId} foi encerrado por inatividade.`);
        wss.close();
    }, WS_TIMEOUT_DURATION);

    wss.on("connection", (ws) => {

        ws.on('message', (message) => {
            clearTimeout(timeout);
            try {
                if (Buffer.isBuffer(message)) {
                    message = message.toString();
                }
                if ( typeof message !== 'string' ) {
                    throw new Error(`Dado inválido, devia ser string mas é ${typeof message}`);
                };
                const data = JSON.parse(message);
                if ( data.type === 'ping' ) { ws.send({ type: 'pong' }); return }
                if ( data.type !== 'message' ) { throw new Error('Mensagem nao possuí uma message em seu conteudo') };
                
                chatSession.sendMessage(data.content)
                .then((result) => {
                    const parsedText = JSON.parse(result.response.candidates[0].content.parts[0].text)
                    const response = {
                        type: "response",
                        content: {
                            response: parsedText.response,
                            suggestion: parsedText.suggestion,
                            userContext: parsedText.userContext,
                            timeout: WS_TIMEOUT_DURATION
                        },
                    };
                    ws.send(JSON.stringify(response));
                    clearTimeout(timeout);
                })
                .catch((error) => {
                    console.error('Erro na requisição da API de IA:', error);
                    ws.send(JSON.stringify({error: 'Ocorreu um erro no processamento da mensagem.'}));
                });

            } catch (error) {
                console.error('Erro ao processar a mensagem:', error);
                ws.send(JSON.stringify({ error: 'Erro ao processar a mensagem.' }));
            };
        });

        ws.on("close", () => {
            console.log(`Usuário desconectou-se de ${chatId}\nFinalizando sessão em ${WS_TIMEOUT_DURATION/1000} segundos.`);
            setTimeout(() => {
                if (wss.clients) return;
                wss.close();
                delete webSocketServers[chatId];
            }, WS_TIMEOUT_DURATION);
        });
        
    });
    
    httpServer.on("upgrade", (request, socket, head) => {
        const pathName = request.url.split('?')[0]; // remove os parâmetros de query
        const key = request.headers['ws-key'];

        if (pathName !== `/chat/${chatId}`) {
            socket.write('HTTP/1.1 404 Não encontrado.\r\n\r\n');
            socket.destroy();
            return
        }

        if (!rateLimiter(key)) {
            socket.write('HTTP/1.1 429 Excedeu o limite de requisições.\r\n\r\n');
            socket.destroy();
            return
        }
        
        if (key !== accessKey) {
            socket.write('HTTP/1.1 401 Acesso Negado.\r\n\r\n');
            socket.destroy();
            return
        }

        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit("connection", ws, request)
            console.log(`Usuário conectou em ${chatId}`);
        });
        return
    });

    return
}