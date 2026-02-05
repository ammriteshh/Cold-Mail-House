import React from 'react';
import ScheduleForm from '../components/ScheduleForm';
import JobList from '../components/JobList';
import Header from '../components/Header';

const Dashboard: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100 pb-10">
            <Header />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Cold Mail House
                    </h1>
                    <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
                        High-performance email scheduling system.
                    </p>
                </div>

                <ScheduleForm />
                <JobList />
            </div>
        </div>
    );
};

export default Dashboard;
