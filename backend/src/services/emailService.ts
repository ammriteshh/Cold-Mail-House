import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const EMAIL_SENDER_NAME = process.env.EMAIL_SENDER_NAME || '';
const REPLY_TO_EMAIL = process.env.REPLY_TO_EMAIL || 'amritesh6767@gmail.com';
const RESEND_ALLOWED_TEST_EMAIL = process.env.RESEND_ALLOWED_TEST_EMAIL;

const FROM_FIELD = EMAIL_SENDER_NAME
    ? `${EMAIL_SENDER_NAME} <${EMAIL_FROM}>`
    : EMAIL_FROM;

if (!RESEND_API_KEY) {
    console.warn('[EmailService] RESEND_API_KEY is missing. Delivery will fail.');
}

const resend = new Resend(RESEND_API_KEY || 'missing_key');

export interface EmailResponse {
    id: string;
}

/**
 * Dispatches an email via Resend API with validation and error handling.
 */
export const sendEmail = async (
    to: string,
    subject: string,
    html: string,
): Promise<EmailResponse> => {
    if (!RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not configured. Cannot send email.');
    }

    if (RESEND_ALLOWED_TEST_EMAIL) {
        const recipient = to.trim().toLowerCase();
        const allowed = RESEND_ALLOWED_TEST_EMAIL.trim().toLowerCase();

        if (recipient !== allowed) {
            const errorMsg = "On free plan, emails can only be sent to your own email address.";
            console.warn(`[EmailService] Blocked email to ${to}: ${errorMsg}`);
            throw new Error(errorMsg);
        }
    }

    console.log(`[EmailService] Sending email to: ${to} | Subject: "${subject}"`);

    const { data, error } = await resend.emails.send({
        from: FROM_FIELD,
        replyTo: REPLY_TO_EMAIL,  // recipients hit Reply → amritesh6767@gmail.com
        to,
        subject,
        html,
    });

    if (error) {
        console.error('[EmailService] Resend API error:', {
            name: error.name,
            message: error.message,
        });
        throw new Error(`Resend API error: ${error.message}`);
    }

    if (!data) {
        throw new Error('Unexpected empty response from Resend.');
    }

    console.log(`[EmailService] Email dispatched successfully. ID: ${data.id}`);
    return { id: data.id };
};

export const checkResendConfig = () => {
    const apiKeyPresent = Boolean(RESEND_API_KEY);

    if (!apiKeyPresent) {
        console.error('[EmailService] RESEND_API_KEY is not set.');
    } else {
        console.log(`[EmailService] Config verified — sending from: "${FROM_FIELD}"`);
    }

    return {
        ok: apiKeyPresent,
        apiKeyPresent,
        from: FROM_FIELD,
        replyTo: REPLY_TO_EMAIL,
    };
};
