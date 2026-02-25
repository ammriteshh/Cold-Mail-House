import { useState } from 'react';
import Layout from '../components/layout/Layout';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader, Wifi } from 'lucide-react';
import { client } from '../api/client';

interface SmtpTestResult {
    status: 'ok' | 'error';
    smtp: {
        host: string;
        port: number;
        user: string;
        from: string;
        secure: boolean;
    };
    message: string;
}

const Settings = () => {
    const [testing, setTesting] = useState(false);
    const [result, setResult] = useState<SmtpTestResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const testSmtp = async () => {
        setTesting(true);
        setResult(null);
        setError(null);
        try {
            const res = await client.get<SmtpTestResult>('/api/diagnostics/smtp');
            setResult(res.data);
        } catch (err: any) {
            const data = err?.response?.data;
            if (data) {
                setResult(data); // still render the response body even on 500
            } else {
                setError(err.message || 'Request failed');
            }
        } finally {
            setTesting(false);
        }
    };

    return (
        <Layout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto space-y-8"
            >
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <Wifi className="h-5 w-5 text-indigo-500" />
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Connection Diagnostics</h2>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Verify the server's connectivity to the configured email provider and view current outbound settings.
                    </p>

                    <button
                        onClick={testSmtp}
                        disabled={testing}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        {testing ? (
                            <><Loader className="h-4 w-4 animate-spin" /> Verifying...</>
                        ) : (
                            <>Verify Connectivity</>
                        )}
                    </button>

                    {result && (
                        <div className={`rounded-lg border p-4 space-y-3 ${result.status === 'ok'
                            ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                            : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                            }`}>
                            <div className="flex items-center gap-2">
                                {result.status === 'ok'
                                    ? <CheckCircle className="h-5 w-5 text-green-500" />
                                    : <XCircle className="h-5 w-5 text-red-500" />}
                                <span className={`text-sm font-medium ${result.status === 'ok' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                                    {result.message}
                                </span>
                            </div>

                            {result.smtp && (
                                <table className="w-full text-xs text-slate-600 dark:text-slate-300">
                                    <tbody>
                                        <tr><td className="py-0.5 pr-4 font-medium">Host</td><td>{result.smtp.host}</td></tr>
                                        <tr><td className="py-0.5 pr-4 font-medium">Port</td><td>{result.smtp.port}</td></tr>
                                        <tr><td className="py-0.5 pr-4 font-medium">User</td><td>{result.smtp.user || <span className="text-red-400">not set</span>}</td></tr>
                                        <tr><td className="py-0.5 pr-4 font-medium">From</td><td>{result.smtp.from}</td></tr>
                                        <tr><td className="py-0.5 pr-4 font-medium">Secure (SSL)</td><td>{result.smtp.secure ? 'Yes (port 465)' : 'No (STARTTLS)'}</td></tr>
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-300">
                            {error}
                        </div>
                    )}
                </div>
            </motion.div>
        </Layout>
    );
};

export default Settings;
