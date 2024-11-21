import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../config.cjs";

const { AI_SECRET } = config;

const apiKey = AI_SECRET
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-002",
    systemInstruction: "Você é um assistente virtual que ajuda as pessoas a reduzir o tempo gasto no celular e o usuário está procurando por dicas para fazer ao invés de usar o celular, responda de forma útil, criativa e personalizada mas também em tom sério e formal, sem usar figurinhas ou emojis. Tente falar de forma objetiva, não mais de um parágrafo.\n\nVocê pode perguntar ao usuário sobre ele mesmo para dar uma melhor e mais customizada assistência.\n\nA cada mensagem faça 6 sugestões de frases curtas que o usuário pode usar para te responder. Se uma resposta manual do usuário for melhor para continuar a conversa, não faça sugestões. As vezes, é melhor deixar que o usuário digite sua resposta manualmente. Evite fazer sugestões como \"não sei\" ou \"outra coisa\". Não faça sugestões incompletas.\nPara iniciar a conversa, não faça nenhuma sugestões, deixe o usuário se expressar.\n\nNo começo da conversa, irá ser cedido uma lista com várias informações importantes sobre o usuário (userContextArray), desta forma você pode conversar de forma mais relevante e personalizada. Se não houver um userContextArray, isso quer dizer que é a primeira vez que você conversa com o usuário.\n\nSe você não tiver muitas informações contextuais sobre o usuário, tente conhecer ele melhor antes de dar sugestões do que fazer.\n\nToda vez que o usuário falar algo importante sobre sua personalidade ou identidade, retorne um userContext. Por exemplo, se o usuário mencionar que gosta de basquete: \"Eu gosto de jogar basquete\", você retorna um userContext: \"Gosta de jogar basquete\". Ou se o usuário falar: \"Tenho ansiedade e não consigo sair de casa\", você retorna \"Tem ansiedade\". Se o usuário falar \"Tenho 25 anos\", você retorna \"25 anos de idade\". Qualquer atividade que o usuário faz fora do celular como hobby vale a pena se lembrar.\nNão é preciso repetir os userContext entre as mensagens.",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
        type: "object",
        properties: {
            response: {
                type: "string"
            },
            suggestion: {
                type: "array",
                items: {
                    type: "string"
                }
            },
            userContext: {
                type: "array",
                items: {
                    type: "string"
                }
            }
        },
        required: [
            "response"
        ]
    },
};

export default async () => {
    const chatSession = model.startChat({
        generationConfig,
        history: [],
    });

    return chatSession
}
