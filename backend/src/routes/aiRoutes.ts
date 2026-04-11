import { Router, type Request, type Response } from 'express';
import { generateColdEmail, type ColdEmailInput } from '../services/geminiService';

const router = Router();

function validateBody(body: unknown): { ok: true; data: ColdEmailInput } | { ok: false; message: string } {
    if (!body || typeof body !== 'object') {
        return { ok: false, message: 'Request body is required' };
    }

    const b = body as Record<string, unknown>;
    const recipientRole = typeof b.recipientRole === 'string' ? b.recipientRole.trim() : '';
    const companyName = typeof b.companyName === 'string' ? b.companyName.trim() : '';
    const userSkills = typeof b.userSkills === 'string' ? b.userSkills.trim() : '';
    const purpose = typeof b.purpose === 'string' ? b.purpose.trim() : '';

    if (!recipientRole || !companyName || !userSkills || !purpose) {
        return {
            ok: false,
            message:
                'All fields are required: recipientRole, companyName, userSkills, purpose (non-empty strings)',
        };
    }

    return {
        ok: true,
        data: { recipientRole, companyName, userSkills, purpose },
    };
}

router.post('/generate-email', async (req: Request, res: Response) => {
    const parsed = validateBody(req.body);
    if (!parsed.ok) {
        return res.status(400).json({
            success: false,
            message: parsed.message,
        });
    }

    try {
        const { email } = await generateColdEmail(parsed.data);
        return res.json({
            success: true,
            email,
        });
    } catch (error) {
        console.error('[aiRoutes] generate-email failed:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to generate email',
        });
    }
});

export default router;
