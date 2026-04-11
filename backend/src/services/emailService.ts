import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const EMAIL_FROM = process.env.EMAIL_FROM || SMTP_USER;
const EMAIL_SENDER_NAME = process.env.EMAIL_SENDER_NAME || 'Cold Mail House';
const REPLY_TO_EMAIL = process.env.REPLY_TO_EMAIL || SMTP_USER;

const FROM_FIELD = EMAIL_SENDER_NAME
    ? `"${EMAIL_SENDER_NAME}" <${EMAIL_FROM}>`
    : EMAIL_FROM;

if (!SMTP_USER || !SMTP_PASS) {
    console.warn('[EmailService] SMTP_USER or SMTP_PASS is missing. Delivery will fail.');
}

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false
    },
    // Force Node.js to use IPv4 to bypass Render's IPv6 ENETUNREACH issues
    family: 4,
} as any);

export interface EmailResponse {
    id: string;
}

/**
 * Dispatches an email via Nodemailer with validation and error handling.
 */
export const sendEmail = async (
    to: string,
    subject: string,
    html: string,
): Promise<EmailResponse> => {
    if (!SMTP_USER || !SMTP_PASS) {
        throw new Error('SMTP credentials are not configured. Cannot send email.');
    }

    console.log(`[EmailService] Sending email to: ${to} | Subject: "${subject}"`);

    try {
        const info = await transporter.sendMail({
            from: FROM_FIELD,
            replyTo: REPLY_TO_EMAIL,
            to,
            subject,
            html,
        });

        console.log(`[EmailService] Email dispatched successfully. Message ID: ${info.messageId}`);
        return { id: info.messageId };
    } catch (error: any) {
        console.error('[EmailService] Nodemailer error:', {
            name: error.name,
            message: error.message,
        });
        throw new Error(`Nodemailer error: ${error.message}`);
    }
};

export const checkResendConfig = () => {
    // Kept the function name as checkResendConfig to avoid breaking routes/dependency changes quickly,
    // though internally it checks SMTP.
    const configPresent = Boolean(SMTP_USER && SMTP_PASS);

    if (!configPresent) {
        console.error('[EmailService] SMTP_USER or SMTP_PASS is not set.');
    } else {
        console.log(`[EmailService] Config verified — sending from: "${FROM_FIELD}"`);
    }

    return {
        ok: configPresent,
        apiKeyPresent: configPresent,
        from: FROM_FIELD,
        replyTo: REPLY_TO_EMAIL,
    };
};
