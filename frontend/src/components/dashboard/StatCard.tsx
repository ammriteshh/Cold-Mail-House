import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon: LucideIcon;
    color?: string; // Tailwind color class prefix e.g. "indigo"
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, trend, icon: Icon, color = "indigo" }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
                </div>
                <div className={`p-2 rounded-lg bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            {change && (
                <div className="mt-4 flex items-center text-sm">
                    <span className={`font-medium ${trend === 'up' ? 'text-green-600 dark:text-green-400' :
                        trend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-slate-500'
                        }`}>
                        {trend === 'up' && '+'}
                        {change}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 ml-1">from last month</span>
                </div>
            )}
        </div>
    );
};

export default StatCard;
