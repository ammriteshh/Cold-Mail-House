import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const getBackendBase = (): string => {
    if (import.meta.env.VITE_BACKEND_URL) {
        return import.meta.env.VITE_BACKEND_URL;
    }
    if (
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1')
    ) {
        return 'http://localhost:3000';
    }
    return 'https://cold-mail-house.onrender.com';
};

const AIGenerator: React.FC = () => {
    const [recipientRole, setRecipientRole] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [userSkills, setUserSkills] = useState('');
    const [purpose, setPurpose] = useState('');
    const [generatedEmail, setGeneratedEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setError(null);
        setGeneratedEmail('');

        const trimmed = {
            recipientRole: recipientRole.trim(),
            companyName: companyName.trim(),
            userSkills: userSkills.trim(),
            purpose: purpose.trim(),
        };

        if (
            !trimmed.recipientRole ||
            !trimmed.companyName ||
            !trimmed.userSkills ||
            !trimmed.purpose
        ) {
            setError('Please fill in all fields before generating.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${getBackendBase()}/api/generate-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(trimmed),
            });

            const data = (await res.json()) as {
                success?: boolean;
                email?: string;
                message?: string;
            };

            if (!res.ok || !data.success || typeof data.email !== 'string') {
                setError(data.message || 'Failed to generate email. Try again.');
                return;
            }

            setGeneratedEmail(data.email);
        } catch {
            setError('Network error. Check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-violet-500" />
                    AI Cold Email Generator
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Describe the recipient and your goal; Gemini drafts a professional cold email.
                </p>
            </div>

            <div className="p-6 space-y-6">
                {error && (
                    <div
                        className="p-3 rounded-lg text-sm font-medium bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Recipient Role
                        </label>
                        <input
                            type="text"
                            value={recipientRole}
                            onChange={(e) => setRecipientRole(e.target.value)}
                            placeholder="e.g. Head of Engineering"
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Company Name
                        </label>
                        <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="e.g. Acme Corp"
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Your Skills
                        </label>
                        <input
                            type="text"
                            value={userSkills}
                            onChange={(e) => setUserSkills(e.target.value)}
                            placeholder="e.g. Full-stack TypeScript, product design"
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Purpose
                        </label>
                        <textarea
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            placeholder="e.g. Request a 15-minute intro call about your API modernization initiative"
                            rows={3}
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all resize-y min-h-[88px]"
                        />
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => void handleGenerate()}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:pointer-events-none shadow-sm transition-colors"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating…
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-4 w-4" />
                            Generate Email
                        </>
                    )}
                </button>

                <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Generated email
                    </label>
                    <textarea
                        value={generatedEmail}
                        readOnly
                        placeholder="Your generated email will appear here."
                        rows={12}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all resize-y min-h-[200px]"
                    />
                </div>
            </div>
        </motion.section>
    );
};

export default AIGenerator;
