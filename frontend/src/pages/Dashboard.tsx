import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import StatCard from '../components/dashboard/StatCard';
import EmailComposer from '../components/dashboard/EmailComposer';
import ScheduledTable from '../components/dashboard/ScheduledTable';
import { Mail, Send, CheckCircle, AlertOctagon } from 'lucide-react';
import { motion } from 'framer-motion';
import { getJobStats, type JobStats } from '../api/jobs';

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<JobStats>({
        sent: 0,
        pending: 0,
        failed: 0,
        successRate: 0
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await getJobStats();
            setStats(res.data);
        } catch (error) {
            console.error("Failed to fetch dashboard statistics", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Layout>
            {/* KPI Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                <StatCard
                    title="Emails Sent"
                    value={loading ? "-" : stats.sent.toString()}
                    icon={Send}
                    color="indigo"
                />
                <StatCard
                    title="Scheduled Count"
                    value={loading ? "-" : stats.pending.toString()}
                    icon={Mail}
                    color="blue"
                />
                <StatCard
                    title="Success Rate"
                    value={loading ? "-" : `${stats.successRate}%`}
                    icon={CheckCircle}
                    color="green"
                />
                <StatCard
                    title="Failed Count"
                    value={loading ? "-" : stats.failed.toString()}
                    icon={AlertOctagon}
                    color="red"
                />
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column: Composer */}
                <div className="xl:col-span-1">
                    <EmailComposer />
                </div>

                {/* Right Column: Table */}
                <div className="xl:col-span-2">
                    <ScheduledTable />
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
