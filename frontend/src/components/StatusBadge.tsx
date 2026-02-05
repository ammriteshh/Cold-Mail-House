import React from 'react';
import type { JobStatus } from '../types/job';

interface Props {
    status: JobStatus;
}

const StatusBadge: React.FC<Props> = ({ status }) => {
    const colors = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        COMPLETED: 'bg-green-100 text-green-800',
        FAILED: 'bg-red-100 text-red-800',
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
