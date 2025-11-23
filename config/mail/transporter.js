import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import logger from '../logger.js'

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

export const verifyMailTransporter = async () => {
    try{
        await transporter.verify();
        logger.info('Mail transporter is ready to send emails');
    }catch(error){
        logger.error('Error verifying mail transporter: %O', error);
    }
}

export default transporter;

