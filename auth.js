import firebase from 'firebase-admin'
import config from './config.cjs'

const { FB_CREDENTIALS } = config

firebase.initializeApp({
    credential: firebase.credential.cert(FB_CREDENTIALS)
})

export default async (req, res, next) => {
    const token = req.headers['x-authorization']

    if (!token) {
        return res.status(401).json({ message: 'Token de autorização não fornecido.' });
    }

    try {
        await firebase.auth().verifyIdToken(token)
        next();
    } catch (error) {
        console.log('Erro ao verificar o token:', error);
        return res.status(401).json({ message: 'Acesso Negado.' });
    }
}