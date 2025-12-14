import dotenv from 'dotenv'
dotenv.config();
import {OAuth2Client} from 'google-auth-library'

const googleClient = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID
})

export const verifyGoogleIdToken = async(idToken)=>{
    if(!idToken){
        throw new Error('ID Token is required');
    }
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        if(!payload || !payload.email){
            throw new Error('Invalid ID Token');
        }
        return payload;
    } catch (error) {
        throw new Error('Error verifying ID Token: ' + error.message);
    }
}