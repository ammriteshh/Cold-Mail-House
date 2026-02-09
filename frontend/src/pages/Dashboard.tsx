import Layout from '../components/layout/Layout';
import StatCard from '../components/dashboard/StatCard';
import EmailComposer from '../components/dashboard/EmailComposer';
import ScheduledTable from '../components/dashboard/ScheduledTable';
import { Mail, Send, CheckCircle, AlertOctagon } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
    return (
        <Layout>
            {/* KPI Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                <StatCard title="Emails Sent" value="1,245" change="12%" trend="up" icon={Send} color="indigo" />
                <StatCard title="Scheduled" value="8" change="2" trend="neutral" icon={Mail} color="blue" />
                <StatCard title="Success Rate" value="98.5%" change="0.5%" trend="up" icon={CheckCircle} color="green" />
                <StatCard title="Failed" value="12" change="3" trend="down" icon={AlertOctagon} color="red" />
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
