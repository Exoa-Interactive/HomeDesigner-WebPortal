import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState } from 'react';

function ProjectModal({ project, onClose, users = [] }) {
    const isEdit = !!project;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: project?.name || '',
        type: project?.type || 'template',
        user_id: project?.user_id || '',
        glb_file: null,
        json_file: null,
        cover_image: null,
    });

    function submit(e) {
        e.preventDefault();

        if (isEdit) {
            post(route('projects.update', project.id), {
                forceFormData: true,
                onSuccess: () => onClose(),
            });
        } else {
            post(route('projects.store'), {
                forceFormData: true,
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900">
                            {isEdit ? 'Edit Project' : 'New Project'}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {isEdit ? 'Update project details and files' : 'Add a new design project'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Project Name
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-shadow"
                            placeholder="e.g. Modern Living Room"
                            required
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
                            <select
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="w-full border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                            >
                                <option value="template">Template</option>
                                <option value="userfile">User File</option>
                            </select>
                            {errors.type && <p className="text-red-500 text-xs mt-1.5">{errors.type}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Owner</label>
                            <select
                                value={data.user_id}
                                onChange={(e) => setData('user_id', e.target.value || '')}
                                className="w-full border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                            >
                                <option value="">System</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                            {errors.user_id && <p className="text-red-500 text-xs mt-1.5">{errors.user_id}</p>}
                        </div>
                    </div>

                    {/* File uploads */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-700">Files</label>
                        {[
                            { key: 'glb_file', accept: '.glb', label: '3D Model', ext: 'GLB', current: project?.glb_url, icon: '3D' },
                            { key: 'json_file', accept: '.json', label: 'Metadata', ext: 'JSON', current: project?.json_url, icon: '{}' },
                            { key: 'cover_image', accept: 'image/*', label: 'Cover Image', ext: 'IMG', current: project?.cover_image, icon: null },
                        ].map(({ key, accept, label, ext, current, icon }) => (
                            <div key={key} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400 flex-shrink-0">
                                    {icon || <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-600">{label}</p>
                                    {isEdit && current && (
                                        <p className="text-[10px] text-slate-400 truncate">{current.split('/').pop()}</p>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept={accept}
                                    onChange={(e) => setData(key, e.target.files[0])}
                                    className="text-xs w-28 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100 cursor-pointer"
                                />
                                {errors[key] && <p className="text-red-500 text-xs">{errors[key]}</p>}
                            </div>
                        ))}
                    </div>

                    {isEdit && project.cover_image && (
                        <div className="flex items-center gap-3">
                            <img
                                src={`/storage/${project.cover_image}`}
                                alt="Current cover"
                                className="w-14 h-14 object-cover rounded-xl ring-1 ring-slate-200"
                            />
                            <span className="text-xs text-slate-400">Current cover</span>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl hover:from-brand-600 hover:to-brand-700 shadow-sm disabled:opacity-50 transition-all"
                        >
                            {processing ? (
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Saving...
                                </span>
                            ) : isEdit ? 'Update Project' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function DeleteConfirm({ project, onClose }) {
    const [processing, setProcessing] = useState(false);

    function handleDelete() {
        setProcessing(true);
        router.delete(route('projects.destroy', project.id), {
            onSuccess: () => onClose(),
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                </div>
                <h2 className="text-lg font-semibold text-slate-900 text-center mb-1">Delete Project</h2>
                <p className="text-sm text-slate-500 text-center mb-6">
                    Are you sure you want to delete <span className="font-semibold text-slate-700">{project.name}</span>? This cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        Keep it
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={processing}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors"
                    >
                        {processing ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Admin({ projects, users, flash }) {
    const [showCreate, setShowCreate] = useState(false);
    const [editProject, setEditProject] = useState(null);
    const [deleteProject, setDeleteProject] = useState(null);

    return (
        <AppLayout>
            <Head title="Admin" />

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Management</h1>
                    <p className="text-sm text-slate-400 mt-1">Manage all design projects and uploads</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl hover:from-brand-600 hover:to-brand-700 shadow-sm hover:shadow transition-all"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Project
                </button>
            </div>

            {flash?.success && (
                <div className="mb-6 flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm border border-emerald-100">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                    </svg>
                    {flash.success}
                </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Projects', value: projects.length, color: 'brand' },
                    { label: 'Templates', value: projects.filter(p => p.type === 'template').length, color: 'blue' },
                    { label: 'User Files', value: projects.filter(p => p.type === 'userfile').length, color: 'amber' },
                    { label: '3D Models', value: projects.filter(p => p.glb_url).length, color: 'emerald' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white rounded-xl border border-slate-200/60 p-4 shadow-card">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white shadow-card rounded-xl border border-slate-200/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Project
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Owner
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Files
                                </th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {projects.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-slate-50 flex items-center justify-center">
                                            <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                            </svg>
                                        </div>
                                        <p className="text-sm font-medium text-slate-500">No projects yet</p>
                                        <p className="text-xs text-slate-400 mt-1">Click "Add Project" to create your first one.</p>
                                    </td>
                                </tr>
                            ) : (
                                projects.map((project) => (
                                    <tr key={project.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden ring-1 ring-slate-200/60">
                                                    {project.cover_image ? (
                                                        <img
                                                            src={`/storage/${project.cover_image}`}
                                                            alt={project.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="font-medium text-slate-900 text-sm">{project.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                                                project.type === 'template'
                                                    ? 'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-100'
                                                    : 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100'
                                            }`}>
                                                {project.type === 'template' ? 'Template' : 'User File'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {project.user ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-[10px] font-semibold text-slate-600">
                                                        {project.user.name.charAt(0)}
                                                    </div>
                                                    <span className="text-sm text-slate-600">{project.user.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-slate-400">--</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1.5">
                                                {project.glb_url && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100">
                                                        GLB
                                                    </span>
                                                )}
                                                {project.json_url && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-100">
                                                        JSON
                                                    </span>
                                                )}
                                                {project.cover_image && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-violet-50 text-violet-600 ring-1 ring-inset ring-violet-100">
                                                        IMG
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400">
                                            {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => setEditProject(project)}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                                                    title="Edit"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => setDeleteProject(project)}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                    title="Delete"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showCreate && (
                <ProjectModal users={users} onClose={() => setShowCreate(false)} />
            )}

            {editProject && (
                <ProjectModal project={editProject} users={users} onClose={() => setEditProject(null)} />
            )}

            {deleteProject && (
                <DeleteConfirm project={deleteProject} onClose={() => setDeleteProject(null)} />
            )}
        </AppLayout>
    );
}
