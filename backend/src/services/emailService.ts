import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const EMAIL_SENDER_NAME = process.env.EMAIL_SENDER_NAME || 'Cold Mail House';
const REPLY_TO_EMAIL = process.env.REPLY_TO_EMAIL || '';

const FROM_FIELD = EMAIL_SENDER_NAME
    ? `"${EMAIL_SENDER_NAME}" <${EMAIL_FROM}>`
    : EMAIL_FROM;

let resend: Resend | null = null;

if (RESEND_API_KEY) {
    resend = new Resend(RESEND_API_KEY);
} else {
    console.warn('[EmailService] RESEND_API_KEY is missing. Delivery will fail.');
}

export interface EmailResponse {
    id: string;
}

/**
 * Dispatches an email via Resend with validation and error handling.
 */
export const sendEmail = async (
    to: string,
    subject: string,
    html: string,
): Promise<EmailResponse> => {
    if (!resend) {
        throw new Error('Resend API key is not configured. Cannot send email.');
    }

    console.log(`[EmailService] Sending email to: ${to} | Subject: "${subject}"`);

    try {
        const payload: any = {
            from: FROM_FIELD,
            to,
            subject,
            html,
        };

        if (REPLY_TO_EMAIL) {
            payload.reply_to = REPLY_TO_EMAIL;
        }

        const { data, error } = await resend.emails.send(payload);

        if (error) {
            console.error('[EmailService] Resend API response error:', error);
            throw new Error(`Resend error: ${error.message}`);
        }

        if (!data?.id) {
            throw new Error('Resend did not return a message ID.');
        }

        console.log(`[EmailService] Email dispatched successfully. Message ID: ${data.id}`);
        return { id: data.id };
    } catch (error: any) {
        console.error('[EmailService] Resend execution error:', error);
        throw error;
    }
};

export const checkResendConfig = () => {
    const configPresent = Boolean(RESEND_API_KEY);

    if (!configPresent) {
        console.error('[EmailService] RESEND_API_KEY is not set.');
    } else {
        console.log(`[EmailService] Config verified — sending from: "${FROM_FIELD}"`);
    }

    return {
        ok: configPresent,
        apiKeyPresent: configPresent,
        from: FROM_FIELD,
        replyTo: REPLY_TO_EMAIL || undefined,
    };
};
