import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex">
            {/* Left panel - branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 items-center justify-center p-12">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-100" />

                <div className="relative z-10 max-w-md text-center">
                    <Link href="/" className="inline-block mb-8">
                        <ApplicationLogo className="h-16 w-16 mx-auto" />
                    </Link>
                    <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">
                        Home Designer Portal
                    </h1>
                    <p className="text-brand-200/80 text-lg leading-relaxed">
                        Design, visualize, and bring your dream spaces to life with immersive 3D previews.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-6">
                        {[
                            { n: '3D', label: 'Preview' },
                            { n: '100+', label: 'Templates' },
                            { n: 'Fast', label: 'Rendering' },
                        ].map(({ n, label }) => (
                            <div key={label} className="text-center">
                                <div className="text-2xl font-bold text-white">{n}</div>
                                <div className="text-xs text-brand-300/70 mt-0.5">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right panel - form */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-slate-50 bg-mesh-gradient">
                <div className="lg:hidden mb-8">
                    <Link href="/" className="flex items-center gap-3">
                        <ApplicationLogo className="h-10 w-10" />
                        <span className="text-xl font-bold text-slate-900">Home Designer</span>
                    </Link>
                </div>

                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-card border border-slate-200/60 px-8 py-8">
                        {children}
                    </div>
                    <p className="mt-6 text-center text-xs text-slate-400">
                        Crafting spaces, inspiring living.
                    </p>
                </div>
            </div>
        </div>
    );
}
