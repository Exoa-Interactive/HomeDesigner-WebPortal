import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState, useCallback } from 'react';

function ResponsePanel({ label, response }) {
    if (!response) return null;
    return (
        <div className="mt-3">
            <div className="text-xs font-medium text-gray-500 mb-1">{label}</div>
            <pre className="bg-gray-900 text-green-400 text-xs p-3 rounded overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap">
                {typeof response === 'string' ? response : JSON.stringify(response, null, 2)}
            </pre>
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">{title}</h2>
            {children}
        </div>
    );
}

function EndpointRow({ method, path, buttonLabel, onClick, loading, children }) {
    const methodColors = {
        GET: 'bg-green-100 text-green-800',
        POST: 'bg-blue-100 text-blue-800',
        DELETE: 'bg-red-100 text-red-800',
    };
    return (
        <div className="border rounded-lg p-4 mb-3">
            <div className="flex items-center gap-3 mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${methodColors[method] || 'bg-gray-100 text-gray-800'}`}>
                    {method}
                </span>
                <code className="text-sm text-gray-700">{path}</code>
                <button
                    onClick={onClick}
                    disabled={loading}
                    className="ml-auto px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                    {loading ? 'Loading...' : buttonLabel}
                </button>
            </div>
            {children}
        </div>
    );
}

export default function ApiTest() {
    const [token, setToken] = useState('');
    const [email, setEmail] = useState('admin@demo.com');
    const [password, setPassword] = useState('password');
    const [projectId, setProjectId] = useState('1');
    const [createName, setCreateName] = useState('');
    const [createType, setCreateType] = useState('template');
    const [createUserId, setCreateUserId] = useState('');
    const [updateName, setUpdateName] = useState('');
    const [updateId, setUpdateId] = useState('1');
    const [deleteId, setDeleteId] = useState('1');

    const [responses, setResponses] = useState({});
    const [loadingStates, setLoadingStates] = useState({});

    const setLoading = (key, val) => setLoadingStates(prev => ({ ...prev, [key]: val }));

    const apiCall = useCallback(async (key, url, options = {}) => {
        setLoading(key, true);
        setResponses(prev => ({ ...prev, [key]: null }));

        const headers = { Accept: 'application/json', ...options.headers };
        if (token && !options.noAuth) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const startTime = performance.now();

        try {
            const res = await fetch(url, { ...options, headers });
            const elapsed = Math.round(performance.now() - startTime);
            let body;
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                body = await res.json();
            } else {
                body = await res.text();
            }

            setResponses(prev => ({
                ...prev,
                [key]: {
                    status: res.status,
                    statusText: res.statusText,
                    time: `${elapsed}ms`,
                    body,
                },
            }));

            return { status: res.status, body };
        } catch (err) {
            setResponses(prev => ({
                ...prev,
                [key]: { error: err.message },
            }));
            return null;
        } finally {
            setLoading(key, false);
        }
    }, [token]);

    const handleLogin = async () => {
        const result = await apiCall('login', '/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            noAuth: true,
        });
        if (result && result.status === 200 && result.body.token) {
            setToken(result.body.token);
        }
    };

    const handleLogout = async () => {
        await apiCall('logout', '/api/logout', { method: 'POST' });
        setToken('');
    };

    const handleGetUser = () => apiCall('user', '/api/user');

    const handleListProjects = () => apiCall('listProjects', '/api/projects', { noAuth: true });

    const handleGetProject = () => apiCall('getProject', `/api/projects/${projectId}`, { noAuth: true });

    const handleMyProjects = () => apiCall('myProjects', '/api/my-projects');

    const handleCreateProject = () => {
        const formData = new FormData();
        formData.append('name', createName || 'New Project');
        formData.append('type', createType);
        if (createUserId) formData.append('user_id', createUserId);

        const glbFile = document.getElementById('create-glb')?.files[0];
        const jsonFile = document.getElementById('create-json')?.files[0];
        const coverFile = document.getElementById('create-cover')?.files[0];
        if (glbFile) formData.append('glb_file', glbFile);
        if (jsonFile) formData.append('json_file', jsonFile);
        if (coverFile) formData.append('cover_image', coverFile);

        return apiCall('createProject', '/api/projects', {
            method: 'POST',
            body: formData,
            noAuth: true,
        });
    };

    const handleUpdateProject = () => {
        const formData = new FormData();
        if (updateName) formData.append('name', updateName);

        const glbFile = document.getElementById('update-glb')?.files[0];
        const jsonFile = document.getElementById('update-json')?.files[0];
        const coverFile = document.getElementById('update-cover')?.files[0];
        if (glbFile) formData.append('glb_file', glbFile);
        if (jsonFile) formData.append('json_file', jsonFile);
        if (coverFile) formData.append('cover_image', coverFile);

        return apiCall('updateProject', `/api/projects/${updateId}`, {
            method: 'POST',
            body: formData,
            noAuth: true,
        });
    };

    const handleDeleteProject = () =>
        apiCall('deleteProject', `/api/projects/${deleteId}`, {
            method: 'DELETE',
            noAuth: true,
        });

    const inputClass = 'border border-gray-300 rounded px-2 py-1 text-sm w-full';

    return (
        <AppLayout>
            <Head title="API Test" />

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">API Test Console</h1>
                {token && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Authenticated
                    </span>
                )}
            </div>

            {/* Token display */}
            {token && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                    <div className="text-xs font-medium text-yellow-800 mb-1">Current Token</div>
                    <code className="text-xs text-yellow-900 break-all">{token}</code>
                </div>
            )}

            {/* Auth Section */}
            <Section title="Authentication">
                <EndpointRow method="POST" path="/api/login" buttonLabel="Login" onClick={handleLogin} loading={loadingStates.login}>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
                        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} />
                    </div>
                    <ResponsePanel label="Response" response={responses.login} />
                </EndpointRow>

                <EndpointRow method="POST" path="/api/logout" buttonLabel="Logout" onClick={handleLogout} loading={loadingStates.logout}>
                    <ResponsePanel label="Response" response={responses.logout} />
                </EndpointRow>

                <EndpointRow method="GET" path="/api/user" buttonLabel="Get User" onClick={handleGetUser} loading={loadingStates.user}>
                    <ResponsePanel label="Response" response={responses.user} />
                </EndpointRow>
            </Section>

            {/* Public Projects */}
            <Section title="Projects (Public)">
                <EndpointRow method="GET" path="/api/projects" buttonLabel="List All" onClick={handleListProjects} loading={loadingStates.listProjects}>
                    <ResponsePanel label="Response" response={responses.listProjects} />
                </EndpointRow>

                <EndpointRow method="GET" path="/api/projects/{id}" buttonLabel="Get" onClick={handleGetProject} loading={loadingStates.getProject}>
                    <div className="mb-2">
                        <input type="text" placeholder="Project ID" value={projectId} onChange={e => setProjectId(e.target.value)} className={inputClass + ' max-w-[120px]'} />
                    </div>
                    <ResponsePanel label="Response" response={responses.getProject} />
                </EndpointRow>
            </Section>

            {/* Authenticated Projects */}
            <Section title="Projects (Authenticated)">
                <EndpointRow method="GET" path="/api/my-projects" buttonLabel="My Projects" onClick={handleMyProjects} loading={loadingStates.myProjects}>
                    <ResponsePanel label="Response" response={responses.myProjects} />
                </EndpointRow>

                <EndpointRow method="POST" path="/api/projects" buttonLabel="Create" onClick={handleCreateProject} loading={loadingStates.createProject}>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                        <input type="text" placeholder="Project Name" value={createName} onChange={e => setCreateName(e.target.value)} className={inputClass} />
                        <select value={createType} onChange={e => setCreateType(e.target.value)} className={inputClass}>
                            <option value="template">template</option>
                            <option value="userfile">userfile</option>
                        </select>
                        <input type="text" placeholder="User ID (optional)" value={createUserId} onChange={e => setCreateUserId(e.target.value)} className={inputClass} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">GLB File</label>
                            <input type="file" id="create-glb" accept=".glb" className="text-xs" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">JSON File</label>
                            <input type="file" id="create-json" accept=".json" className="text-xs" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Cover Image</label>
                            <input type="file" id="create-cover" accept="image/*" className="text-xs" />
                        </div>
                    </div>
                    <ResponsePanel label="Response" response={responses.createProject} />
                </EndpointRow>

                <EndpointRow method="POST" path="/api/projects/{id}" buttonLabel="Update" onClick={handleUpdateProject} loading={loadingStates.updateProject}>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <input type="text" placeholder="Project ID" value={updateId} onChange={e => setUpdateId(e.target.value)} className={inputClass} />
                        <input type="text" placeholder="New Name (optional)" value={updateName} onChange={e => setUpdateName(e.target.value)} className={inputClass} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">GLB File</label>
                            <input type="file" id="update-glb" accept=".glb" className="text-xs" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">JSON File</label>
                            <input type="file" id="update-json" accept=".json" className="text-xs" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Cover Image</label>
                            <input type="file" id="update-cover" accept="image/*" className="text-xs" />
                        </div>
                    </div>
                    <ResponsePanel label="Response" response={responses.updateProject} />
                </EndpointRow>

                <EndpointRow method="DELETE" path="/api/projects/{id}" buttonLabel="Delete" onClick={handleDeleteProject} loading={loadingStates.deleteProject}>
                    <div className="mb-2">
                        <input type="text" placeholder="Project ID" value={deleteId} onChange={e => setDeleteId(e.target.value)} className={inputClass + ' max-w-[120px]'} />
                    </div>
                    <ResponsePanel label="Response" response={responses.deleteProject} />
                </EndpointRow>
            </Section>
        </AppLayout>
    );
}
