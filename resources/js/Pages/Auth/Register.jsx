import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Create Account" />

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create your account</h2>
                <p className="text-sm text-slate-500 mt-1">Start designing your dream spaces</p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Full name
                    </label>
                    <input
                        id="name"
                        name="name"
                        value={data.name}
                        className="w-full border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-shadow placeholder:text-slate-300"
                        autoComplete="name"
                        autoFocus
                        placeholder="John Doe"
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-1.5" />
                </div>

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
                        placeholder="you@example.com"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="w-full border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-shadow placeholder:text-slate-300"
                        autoComplete="new-password"
                        placeholder="Min. 8 characters"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-slate-700 mb-1.5">
                        Confirm password
                    </label>
                    <input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="w-full border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-shadow placeholder:text-slate-300"
                        autoComplete="new-password"
                        placeholder="Re-enter your password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-1.5" />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3 px-4 text-sm font-semibold text-white bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-50"
                >
                    {processing ? 'Creating account...' : 'Create account'}
                </button>

                <p className="text-center text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link href={route('login')} className="font-semibold text-brand-600 hover:text-brand-700">
                        Sign in
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
