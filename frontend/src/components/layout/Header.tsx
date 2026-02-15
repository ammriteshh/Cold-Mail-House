


const Header = () => {
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
                {/* Future: User Profile / Notifications */}
            </div>
        </header>
    );
};

export default Header;
