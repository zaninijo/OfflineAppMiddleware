import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../config.cjs";

const { AI_SECRET } = config;

const apiKey = AI_SECRET
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-8b",
    systemInstruction: "Gerar um relatório criativo sobre o uso de aplicativos com base nos dados em JSON que serão fornecidos pelo usuário.\nProcure fazer comparações com atividades do mundo real para ajudar a mensurar o tempo gasto com aplicativos.\nFaça sugestões sobre como o usuário pode utilizar o tempo que seria gasto em aplicativos a partir de adiante de acordo com seus gosto.\nEvite cerimonialismos, seja direto e fale em tom formal, sério, e somente texto.",
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
    responseSchema: {
        type: "object",
        properties: {
            response: {
                type: "string"
            }
        },
        required: [
            "response"
        ]
    },
};

export default async (usageData) => {

    const chatSession = model.startChat({
        generationConfig,
        history: [],
    });

    return await chatSession.sendMessage(usageData)
}