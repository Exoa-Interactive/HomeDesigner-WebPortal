import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { useState, useCallback } from 'react';

function ResponsePanel({ label, response }) {
    if (!response) return null;
    return (
        <div className="mt-3">
            <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
                {response.status && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        response.status < 300 ? 'bg-emerald-50 text-emerald-600' :
                        response.status < 500 ? 'bg-amber-50 text-amber-600' :
                        'bg-red-50 text-red-600'
                    }`}>
                        {response.status} {response.statusText}
                    </span>
                )}
                {response.time && (
                    <span className="text-[10px] text-slate-400">{response.time}</span>
                )}
            </div>
            <pre className="bg-slate-900 text-emerald-400 text-xs p-4 rounded-xl overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed border border-slate-800">
                {response.error ? `Error: ${response.error}` : typeof response.body === 'string' ? response.body : JSON.stringify(response.body, null, 2)}
            </pre>
        </div>
    );
}

function Section({ title, icon, children }) {
    return (
        <div className="bg-white rounded-xl shadow-card border border-slate-200/60 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                    {icon}
                </div>
                <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            </div>
            <div className="p-6 space-y-4">
                {children}
            </div>
        </div>
    );
}

function EndpointRow({ method, path, buttonLabel, onClick, loading, children }) {
    const methodStyles = {
        GET: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100',
        POST: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100',
        DELETE: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-100',
    };
    return (
        <div className="rounded-xl border border-slate-100 p-4 hover:border-slate-200 transition-colors">
            <div className="flex items-center gap-3 mb-3">
                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide ${methodStyles[method] || 'bg-slate-50 text-slate-700'}`}>
                    {method}
                </span>
                <code className="text-sm text-slate-600 font-mono">{path}</code>
                <button
                    onClick={onClick}
                    disabled={loading}
                    className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-500 to-brand-600 text-white text-xs font-semibold rounded-lg hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 shadow-sm transition-all"
                >
                    {loading ? (
                        <>
                            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Running...
                        </>
                    ) : (
                        <>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                            </svg>
                            {buttonLabel}
                        </>
                    )}
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

    const inputClass = 'border-slate-200 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-sm transition-shadow placeholder:text-slate-300';

    return (
        <AppLayout>
            <Head title="API Test" />

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">API Console</h1>
                    <p className="text-sm text-slate-400 mt-1">Test and explore the REST API endpoints</p>
                </div>
                {token && (
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        Authenticated
                    </span>
                )}
            </div>

            {token && (
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-2 mb-1.5">
                        <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-semibold text-amber-700">Bearer Token</span>
                    </div>
                    <code className="text-xs text-amber-800/70 break-all font-mono">{token}</code>
                </div>
            )}

            {/* Auth */}
            <Section title="Authentication" icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
            }>
                <EndpointRow method="POST" path="/api/login" buttonLabel="Login" onClick={handleLogin} loading={loadingStates.login}>
                    <div className="grid grid-cols-2 gap-3 mb-2">
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

            {/* Public */}
            <Section title="Projects (Public)" icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
            }>
                <EndpointRow method="GET" path="/api/projects" buttonLabel="List All" onClick={handleListProjects} loading={loadingStates.listProjects}>
                    <ResponsePanel label="Response" response={responses.listProjects} />
                </EndpointRow>

                <EndpointRow method="GET" path="/api/projects/{id}" buttonLabel="Get" onClick={handleGetProject} loading={loadingStates.getProject}>
                    <div className="mb-2">
                        <input type="text" placeholder="Project ID" value={projectId} onChange={e => setProjectId(e.target.value)} className={inputClass + ' max-w-[140px]'} />
                    </div>
                    <ResponsePanel label="Response" response={responses.getProject} />
                </EndpointRow>
            </Section>

            {/* Authenticated */}
            <Section title="Projects (Authenticated)" icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
            }>
                <EndpointRow method="GET" path="/api/my-projects" buttonLabel="My Projects" onClick={handleMyProjects} loading={loadingStates.myProjects}>
                    <ResponsePanel label="Response" response={responses.myProjects} />
                </EndpointRow>

                <EndpointRow method="POST" path="/api/projects" buttonLabel="Create" onClick={handleCreateProject} loading={loadingStates.createProject}>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                        <input type="text" placeholder="Project Name" value={createName} onChange={e => setCreateName(e.target.value)} className={inputClass} />
                        <select value={createType} onChange={e => setCreateType(e.target.value)} className={inputClass}>
                            <option value="template">template</option>
                            <option value="userfile">userfile</option>
                        </select>
                        <input type="text" placeholder="User ID (optional)" value={createUserId} onChange={e => setCreateUserId(e.target.value)} className={inputClass} />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                            <label className="text-[11px] text-slate-400 font-medium block mb-1">GLB File</label>
                            <input type="file" id="create-glb" accept=".glb" className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-brand-50 file:text-brand-600" />
                        </div>
                        <div>
                            <label className="text-[11px] text-slate-400 font-medium block mb-1">JSON File</label>
                            <input type="file" id="create-json" accept=".json" className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-brand-50 file:text-brand-600" />
                        </div>
                        <div>
                            <label className="text-[11px] text-slate-400 font-medium block mb-1">Cover Image</label>
                            <input type="file" id="create-cover" accept="image/*" className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-brand-50 file:text-brand-600" />
                        </div>
                    </div>
                    <ResponsePanel label="Response" response={responses.createProject} />
                </EndpointRow>

                <EndpointRow method="POST" path="/api/projects/{id}" buttonLabel="Update" onClick={handleUpdateProject} loading={loadingStates.updateProject}>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <input type="text" placeholder="Project ID" value={updateId} onChange={e => setUpdateId(e.target.value)} className={inputClass} />
                        <input type="text" placeholder="New Name (optional)" value={updateName} onChange={e => setUpdateName(e.target.value)} className={inputClass} />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                            <label className="text-[11px] text-slate-400 font-medium block mb-1">GLB File</label>
                            <input type="file" id="update-glb" accept=".glb" className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-brand-50 file:text-brand-600" />
                        </div>
                        <div>
                            <label className="text-[11px] text-slate-400 font-medium block mb-1">JSON File</label>
                            <input type="file" id="update-json" accept=".json" className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-brand-50 file:text-brand-600" />
                        </div>
                        <div>
                            <label className="text-[11px] text-slate-400 font-medium block mb-1">Cover Image</label>
                            <input type="file" id="update-cover" accept="image/*" className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-brand-50 file:text-brand-600" />
                        </div>
                    </div>
                    <ResponsePanel label="Response" response={responses.updateProject} />
                </EndpointRow>

                <EndpointRow method="DELETE" path="/api/projects/{id}" buttonLabel="Delete" onClick={handleDeleteProject} loading={loadingStates.deleteProject}>
                    <div className="mb-2">
                        <input type="text" placeholder="Project ID" value={deleteId} onChange={e => setDeleteId(e.target.value)} className={inputClass + ' max-w-[140px]'} />
                    </div>
                    <ResponsePanel label="Response" response={responses.deleteProject} />
                </EndpointRow>
            </Section>
        </AppLayout>
    );
}
