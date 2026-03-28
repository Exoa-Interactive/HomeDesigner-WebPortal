import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Sign in" />

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
                <p className="text-sm text-slate-500 mt-1">Sign in to access your projects</p>
            </div>

            {status && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-sm font-medium text-emerald-600 border border-emerald-100">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Email address
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="w-full border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-shadow placeholder:text-slate-300"
                        autoComplete="username"
                        autoFocus
                        placeholder="you@example.com"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                            Password
                        </label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs font-medium text-brand-600 hover:text-brand-700"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="w-full border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-shadow placeholder:text-slate-300"
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div className="flex items-center">
                    <input
                        id="remember"
                        type="checkbox"
                        name="remember"
                        checked={data.remember}
                        className="rounded-md border-slate-300 text-brand-600 focus:ring-brand-500/20 shadow-sm"
                        onChange={(e) => setData('remember', e.target.checked)}
                    />
                    <label htmlFor="remember" className="ml-2.5 text-sm text-slate-600">
                        Remember me
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3 px-4 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50"
                >
                    {processing ? 'Signing in...' : 'Sign in'}
                </button>

                <p className="text-center text-sm text-slate-500">
                    Don't have an account?{' '}
                    <Link href={route('register')} className="font-semibold text-brand-600 hover:text-brand-700">
                        Create one
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
