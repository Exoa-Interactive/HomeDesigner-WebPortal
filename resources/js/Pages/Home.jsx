import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ProjectPreviewModal from '@/Components/ProjectPreviewModal';
import { useState } from 'react';

export default function Home({ projects }) {
    const [previewProject, setPreviewProject] = useState(null);

    return (
        <AppLayout>
            <Head title="Home" />

            <h1 className="text-2xl font-bold text-gray-900 mb-6">3D Project Library</h1>

            {projects.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No projects yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
                        >
                            <div className="aspect-square bg-gray-200 flex items-center justify-center">
                                {project.cover_image ? (
                                    <img
                                        src={`/storage/${project.cover_image}`}
                                        alt={project.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                    </svg>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
                                <div className="mt-2 flex items-center justify-between">
                                    <div className="flex space-x-2">
                                        {project.glb_url && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                GLB
                                            </span>
                                        )}
                                        {project.json_url && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                JSON
                                            </span>
                                        )}
                                    </div>
                                    {project.glb_url && (
                                        <button
                                            onClick={() => setPreviewProject(project)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 7.5V18M15 7.5V18M3 16.811V8.69c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 010 1.954l-7.108 4.061A1.125 1.125 0 013 16.811z" />
                                            </svg>
                                            3D Preview
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
