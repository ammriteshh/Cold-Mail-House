import { Resend } from 'resend';

// ─── Env vars ─────────────────────────────────────────────────────────────────
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const EMAIL_SENDER_NAME = process.env.EMAIL_SENDER_NAME || '';
const REPLY_TO_EMAIL = process.env.REPLY_TO_EMAIL || 'amritesh6767@gmail.com';
const RESEND_ALLOWED_TEST_EMAIL = process.env.RESEND_ALLOWED_TEST_EMAIL;

// Build "Amritesh Singh <onboarding@resend.dev>" — falls back to bare email if name not set
const FORMATTED_FROM = EMAIL_SENDER_NAME
    ? `${EMAIL_SENDER_NAME} <${EMAIL_FROM}>`
    : EMAIL_FROM;

if (!RESEND_API_KEY) {
    console.error('❌ [emailService] RESEND_API_KEY is missing. Emails will not be sent.');
}

// ─── Singleton Resend client ──────────────────────────────────────────────────
const resend = new Resend(RESEND_API_KEY || 'missing_key');

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ResendSendResult {
    id: string;
}

/**
 * Sends an email using the Resend API.
 *
 * @param to      - Recipient email address
 * @param subject - Email subject line
 * @param html    - HTML body content
 * @returns       - Resend response object containing the message `id`
 * @throws        - Re-throws Resend API errors with full details logged
 */
export const sendEmail = async (
    to: string,
    subject: string,
    html: string,
): Promise<ResendSendResult> => {
    if (!RESEND_API_KEY) {
        throw new Error('RESEND_API_KEY is not configured. Cannot send email.');
    }

    // ── Resend Free Plan Validation ───────────────────────────────────────────
    if (RESEND_ALLOWED_TEST_EMAIL) {
        const recipient = to.trim().toLowerCase();
        const allowed = RESEND_ALLOWED_TEST_EMAIL.trim().toLowerCase();

        if (recipient !== allowed) {
            const errorMsg = "On free plan, emails can only be sent to your own email address.";
            console.warn(`⚠️ [emailService] Blocked email to ${to}: ${errorMsg}`);
            throw new Error(errorMsg);
        }
    }

    console.log(`📧 [emailService] Sending email to: ${to} | Subject: "${subject}" | From: "${FORMATTED_FROM}"`);

    const { data, error } = await resend.emails.send({
        from: FORMATTED_FROM,  // "Amritesh Singh <onboarding@resend.dev>"
        replyTo: REPLY_TO_EMAIL,  // recipients hit Reply → amritesh6767@gmail.com
        to,
        subject,
        html,
    });

    if (error) {
        console.error('❌ [emailService] Resend API error:', {
            name: error.name,
            message: error.message,
        });
        throw new Error(`Resend API error: ${error.message}`);
    }

    if (!data) {
        throw new Error('Resend returned no data and no error — unexpected response.');
    }

    console.log(`✅ [emailService] Email sent successfully. Resend ID: ${data.id}`);
    return { id: data.id };
};

/**
 * Checks Resend configuration without sending a real email.
 * Returns a status object indicating whether the service is ready.
 */
export const checkResendConfig = (): {
    ok: boolean;
    apiKeyPresent: boolean;
    from: string;
    replyTo: string;
} => {
    const apiKeyPresent = Boolean(RESEND_API_KEY);

    if (!apiKeyPresent) {
        console.error('❌ [emailService] RESEND_API_KEY is not set.');
    } else {
        console.log(`✅ [emailService] Resend config OK — from: "${FORMATTED_FROM}", replyTo: ${REPLY_TO_EMAIL}`);
    }

    return {
        ok: apiKeyPresent,
        apiKeyPresent,
        from: FORMATTED_FROM,
        replyTo: REPLY_TO_EMAIL,
    };
};
