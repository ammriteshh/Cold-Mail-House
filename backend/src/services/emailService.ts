import nodemailer from 'nodemailer';
import { config } from '../config';

// Singleton transporter instance
let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
    if (!transporter) {
        const port = config.email.port;
        transporter = nodemailer.createTransport({
            host: config.email.host,
            port,
            secure: port === 465, // true for 465 (SSL), false for 587 (STARTTLS)
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
            from: config.email.from,
            to,
            subject,
            html,
        });
        return info;
    } catch (error: any) {
        // Reset cached transporter so a config fix takes effect on next attempt
        transporter = null;
        console.error('❌ [emailService] SMTP send failed:', error);
        // Re-throw the real error so callers (worker, logs, DB) get accurate details
        throw error;
    }
};

/**
 * Verifies the SMTP connection configuration.
 * @returns {Promise<boolean>} True if connection is verified, false otherwise.
 */
export const verifyConnection = async (): Promise<boolean> => {
    const transport = getTransporter();
    try {
        await transport.verify();
        console.log('✅ SMTP Connection Verified');
        return true;
    } catch (error) {
        console.error('❌ SMTP Connection Failed:', error);
        return false;
    }
};
