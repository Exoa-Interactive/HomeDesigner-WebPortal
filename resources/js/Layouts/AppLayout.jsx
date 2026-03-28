import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { useState } from 'react';

export default function AppLayout({ children }) {
    const { auth, url } = usePage().props;
    const currentUrl = usePage().url;
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLinks = [
        { href: '/', label: 'Explore', icon: ExploreIcon },
        ...(auth?.user ? [{ href: '/admin', label: 'Admin', icon: AdminIcon }] : []),
        { href: '/api-test', label: 'API', icon: ApiIcon },
    ];

    function isActive(href) {
        if (href === '/') return currentUrl === '/';
        return currentUrl.startsWith(href);
    }

    return (
        <div className="min-h-screen bg-slate-50 bg-mesh-gradient">
            {/* Navigation */}
            <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-nav">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Brand */}
                        <div className="flex items-center gap-8">
                            <Link href="/" className="flex items-center gap-3 group">
                                <ApplicationLogo className="h-9 w-9 transition-transform group-hover:scale-105" />
                                <div className="hidden sm:block">
                                    <span className="text-lg font-bold text-slate-900 tracking-tight">
                                        Home Designer
                                    </span>
                                    <span className="text-lg font-light text-brand-500 tracking-tight ml-1">
                                        Portal
                                    </span>
                                </div>
                            </Link>

                            {/* Desktop Nav */}
                            <div className="hidden md:flex items-center gap-1">
                                {navLinks.map(({ href, label, icon: Icon }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                            isActive(href)
                                                ? 'bg-brand-50 text-brand-700'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" active={isActive(href)} />
                                        {label}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-3">
                            {auth?.user ? (
                                <div className="flex items-center gap-3">
                                    <div className="hidden sm:flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-semibold shadow-sm">
                                            {auth.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium text-slate-700">
                                            {auth.user.name}
                                        </span>
                                    </div>
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                                    >
                                        Sign out
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={route('login')}
                                        className="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                                    >
                                        Sign in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="text-sm font-medium text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}

                            {/* Mobile menu toggle */}
                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {mobileOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Nav */}
                {mobileOpen && (
                    <div className="md:hidden border-t border-slate-200/60 bg-white/95 backdrop-blur-xl animate-fade-in">
                        <div className="px-4 py-3 space-y-1">
                            {navLinks.map(({ href, label, icon: Icon }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                        isActive(href)
                                            ? 'bg-brand-50 text-brand-700'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" active={isActive(href)} />
                                    {label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            {/* Main content */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200/60 bg-white/50 backdrop-blur-sm mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <ApplicationLogo className="w-5 h-5 opacity-60" />
                            <span>Home Designer Portal</span>
                        </div>
                        <p className="text-sm text-slate-400">
                            Crafting spaces, inspiring living.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function ExploreIcon({ className, active }) {
    return (
        <svg className={className} fill="none" stroke={active ? 'currentColor' : 'currentColor'} strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
    );
}

function AdminIcon({ className, active }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
        </svg>
    );
}

function ApiIcon({ className, active }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
    );
}
