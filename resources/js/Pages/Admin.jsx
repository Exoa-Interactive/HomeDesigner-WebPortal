import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState } from 'react';

function ProjectModal({ project, onClose }) {
    const isEdit = !!project;

    const { data, setData, post, processing, errors, reset } = useForm({
        name: project?.name || '',
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">
                        {isEdit ? 'Edit Project' : 'Add New Project'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={submit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name *
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            GLB File {isEdit && '(leave empty to keep current)'}
                        </label>
                        <input
                            type="file"
                            accept=".glb"
                            onChange={(e) => setData('glb_file', e.target.files[0])}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        {errors.glb_file && <p className="text-red-500 text-sm mt-1">{errors.glb_file}</p>}
                        {isEdit && project.glb_url && (
                            <p className="text-xs text-gray-400 mt-1">Current: {project.glb_url.split('/').pop()}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            JSON File {isEdit && '(leave empty to keep current)'}
                        </label>
                        <input
                            type="file"
                            accept=".json"
                            onChange={(e) => setData('json_file', e.target.files[0])}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        {errors.json_file && <p className="text-red-500 text-sm mt-1">{errors.json_file}</p>}
                        {isEdit && project.json_url && (
                            <p className="text-xs text-gray-400 mt-1">Current: {project.json_url.split('/').pop()}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cover Image {isEdit && '(leave empty to keep current)'}
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setData('cover_image', e.target.files[0])}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        {errors.cover_image && <p className="text-red-500 text-sm mt-1">{errors.cover_image}</p>}
                        {isEdit && project.cover_image && (
                            <div className="mt-2">
                                <img
                                    src={`/storage/${project.cover_image}`}
                                    alt="Current cover"
                                    className="w-20 h-20 object-cover rounded"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : isEdit ? 'Update' : 'Create'}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete Project</h2>
                <p className="text-gray-600 mb-6">
                    Are you sure you want to delete <strong>{project.name}</strong>? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={processing}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                        {processing ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Admin({ projects, flash }) {
    const [showCreate, setShowCreate] = useState(false);
    const [editProject, setEditProject] = useState(null);
    const [deleteProject, setDeleteProject] = useState(null);

    return (
        <AppLayout>
            <Head title="Admin" />

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                <button
                    onClick={() => setShowCreate(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                    + Add Project
                </button>
            </div>

            {flash?.success && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
                    {flash.success}
                </div>
            )}

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Project
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Files
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {projects.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                    No projects yet. Click "Add Project" to create one.
                                </td>
                            </tr>
                        ) : (
                            projects.map((project) => (
                                <tr key={project.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0 w-10 h-10 rounded bg-gray-200 flex items-center justify-center overflow-hidden">
                                                {project.cover_image ? (
                                                    <img
                                                        src={`/storage/${project.cover_image}`}
                                                        alt={project.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className="font-medium text-gray-900">{project.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
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
                                            {project.cover_image && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                    Cover
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(project.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => setEditProject(project)}
                                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setDeleteProject(project)}
                                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showCreate && (
                <ProjectModal onClose={() => setShowCreate(false)} />
            )}

            {editProject && (
                <ProjectModal project={editProject} onClose={() => setEditProject(null)} />
            )}

            {deleteProject && (
                <DeleteConfirm project={deleteProject} onClose={() => setDeleteProject(null)} />
            )}
        </AppLayout>
    );
}
