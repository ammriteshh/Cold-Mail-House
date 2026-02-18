import React from 'react';
import type { JobStatus } from '../types/job';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface Props {
    status: JobStatus | string; // Allow string to support 'SENT' if legacy data exists
}

const StatusBadge: React.FC<Props> = ({ status }) => {
    // Normalize status: Handle 'SENT' as 'COMPLETED' if needed, or just match keys
    const normalizedStatus = status;

    const styles: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900",
        SENT: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900",
        FAILED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900",
    };

    const icons: Record<string, React.ReactNode> = {
        PENDING: <Clock className="w-3 h-3 mr-1" />,
        SENT: <CheckCircle className="w-3 h-3 mr-1" />,
        FAILED: <XCircle className="w-3 h-3 mr-1" />,
    };

    const style = styles[normalizedStatus] || "bg-gray-100 text-gray-800 border-gray-200";
    const icon = icons[normalizedStatus] || null;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style}`}>
            {icon}
            {normalizedStatus}
        </span>
    );
};

export default StatusBadge;
