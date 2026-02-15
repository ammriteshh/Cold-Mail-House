import nodemailer from 'nodemailer';
import { config } from '../config';

// Singleton transporter instance
let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: config.email.host,
            port: config.email.port,
            secure: false, // true for 465, false for other ports
            auth: {
                user: config.email.user,
                pass: config.email.pass,
            },
        });
    }
    return transporter;
};

/**
 * Sends an email using the configured transporter.
 * 
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - Email body (HTML)
 * @returns {Promise<any>} - Nodemailer send info
 */
export const sendEmail = async (to: string, subject: string, html: string) => {
    const transport = getTransporter();

    try {
        const info = await transport.sendMail({
            from: '"Cold Mail House" <system@coldmail.com>',
            to,
            subject,
            html,
        });
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};
