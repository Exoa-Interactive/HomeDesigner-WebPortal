import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ProjectPreviewModal from '@/Components/ProjectPreviewModal';
import { useState } from 'react';

export default function Home({ projects }) {
    const [previewProject, setPreviewProject] = useState(null);
    const [filter, setFilter] = useState('all');

    const filteredProjects = filter === 'all'
        ? projects
        : projects.filter(p => p.type === filter);

    return (
        <AppLayout>
            <Head title="Home" />

            {/* Hero Section */}
            <div className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 px-8 py-14 sm:px-12 sm:py-16">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

                <div className="relative z-10 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/15 border border-brand-400/20 mb-5">
                        <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                        <span className="text-xs font-medium text-brand-300 tracking-wide uppercase">
                            Design Platform
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight text-balance leading-tight">
                        Your 3D Design
                        <span className="block mt-1 bg-gradient-to-r from-brand-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                            Projects Gallery
                        </span>
                    </h1>
                    <p className="mt-4 text-base sm:text-lg text-slate-300/80 max-w-lg leading-relaxed">
                        Browse, preview, and manage your home design projects.
                        Experience your spaces in immersive 3D before they come to life.
                    </p>

                    <div className="mt-8 flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-300/70">
                            <svg className="w-4 h-4 text-brand-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>{projects.length} Project{projects.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300/70">
                            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5V18M15 7.5V18M3 16.811V8.69c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 010 1.954l-7.108 4.061A1.125 1.125 0 013 16.811z" />
                            </svg>
                            <span>{projects.filter(p => p.glb_url).length} 3D Models</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter bar */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div className="flex items-center gap-2">
                    {[
                        { key: 'all', label: 'All Projects' },
                        { key: 'template', label: 'Templates' },
                        { key: 'userfile', label: 'My Files' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                filter === key
                                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-200'
                                    : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <p className="text-sm text-slate-400">
                    {filteredProjects.length} result{filteredProjects.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Project Grid */}
            {filteredProjects.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No projects found</h3>
                    <p className="text-slate-400 max-w-sm mx-auto">
                        {filter !== 'all'
                            ? 'Try a different filter to see more projects.'
                            : 'Projects will appear here once they are created.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProjects.map((project, idx) => (
                        <div
                            key={project.id}
                            className={`group bg-white rounded-xl shadow-card card-hover overflow-hidden opacity-0 animate-fade-in-up stagger-${Math.min(idx + 1, 8)}`}
                        >
                            {/* Image */}
                            <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                {project.cover_image ? (
                                    <img
                                        src={`/storage/${project.cover_image}`}
                                        alt={project.name}
                                        className="w-full h-full object-cover img-zoom"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                                        <svg className="w-14 h-14 text-slate-200" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                                        </svg>
                                    </div>
                                )}

                                {/* Type badge overlay */}
                                <div className="absolute top-3 left-3">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-md shadow-sm ${
                                        project.type === 'template'
                                            ? 'bg-white/90 text-brand-700'
                                            : 'bg-white/90 text-amber-700'
                                    }`}>
                                        {project.type === 'template' ? 'Template' : 'User File'}
                                    </span>
                                </div>

                                {/* 3D Preview overlay button */}
                                {project.glb_url && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                        <button
                                            onClick={() => setPreviewProject(project)}
                                            className="flex items-center gap-2 px-5 py-2.5 bg-white/95 backdrop-blur-sm text-slate-900 text-sm font-semibold rounded-xl shadow-lg hover:bg-white transition-all transform translate-y-2 group-hover:translate-y-0 duration-300"
                                        >
                                            <svg className="w-4 h-4 text-brand-600" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                            View in 3D
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                <h3 className="font-semibold text-slate-900 truncate text-[15px]">
                                    {project.name}
                                </h3>

                                <div className="mt-3 flex items-center justify-between">
                                    <div className="flex gap-1.5">
                                        {project.glb_url && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                                                </svg>
                                                3D
                                            </span>
                                        )}
                                        {project.json_url && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100">
                                                JSON
                                            </span>
                                        )}
                                    </div>
                                    {project.glb_url && (
                                        <button
                                            onClick={() => setPreviewProject(project)}
                                            className="text-brand-600 hover:text-brand-700 text-xs font-medium md:hidden"
                                        >
                                            Preview
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {previewProject && (
                <ProjectPreviewModal
                    project={previewProject}
                    onClose={() => setPreviewProject(null)}
                />
            )}
        </AppLayout>
    );
}
