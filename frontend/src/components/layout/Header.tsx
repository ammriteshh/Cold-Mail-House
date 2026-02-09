import { Search, Bell, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Header = () => {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-10 transition-colors duration-300">
            {/* Breadcrumbs / Title */}
            <div className="flex items-center gap-2">
                <span className="text-slate-400 text-sm">Applications</span>
                <span className="text-slate-300 text-sm">/</span>
                <span className="text-slate-900 dark:text-white font-medium text-sm">Dashboard</span>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative hidden md:block">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="h-9 w-64 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-9 pr-4 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                </div>

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

                <button
                    onClick={toggleTheme}
                    className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                    title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    <span className="dark:hidden"><Moon className="h-5 w-5" /></span>
                    <span className="hidden dark:block"><Sun className="h-5 w-5" /></span>
                </button>

                <button className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border border-white dark:border-slate-900"></span>
                </button>
            </div>
        </header>
    );
};

export default Header;
