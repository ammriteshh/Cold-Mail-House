import Layout from '../components/layout/Layout';
import EmailComposer from '../components/dashboard/EmailComposer';
import ScheduledTable from '../components/dashboard/ScheduledTable';
import AIGenerator from '../components/AIGenerator';

const Dashboard: React.FC = () => {
    return (
        <Layout>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-1">
                    <EmailComposer />
                </div>

                <div className="xl:col-span-2">
                    <ScheduledTable />
                </div>
            </div>

            <AIGenerator />
        </Layout>
    );
};

export default Dashboard;
