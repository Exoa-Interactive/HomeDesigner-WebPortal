import { Link, usePage } from '@inertiajs/react';

export default function AppLayout({ children }) {
    const { auth } = usePage().props;

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center space-x-8">
                            <Link href="/" className="text-xl font-bold text-gray-900">
                                Home Designer Web Portal
                            </Link>
                            <Link
                                href="/"
                                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                            >
                                Home
                            </Link>
                            {auth?.user && (
                                <Link
                                    href="/admin"
                                    className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                                >
                                    Admin
                                </Link>
                            )}
                            <Link
                                href="/api-test"
                                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                            >
                                API Test
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            {auth?.user ? (
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-600">{auth.user.name}</span>
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="text-sm text-gray-600 hover:text-gray-900"
                                    >
                                        Logout
                                    </Link>
                                </div>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="text-sm text-gray-600 hover:text-gray-900"
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
