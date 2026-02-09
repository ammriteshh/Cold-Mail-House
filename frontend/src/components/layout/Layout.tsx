import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <Sidebar />
            <Header />
            <main className="pl-64 pt-16 min-h-screen">
                <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
