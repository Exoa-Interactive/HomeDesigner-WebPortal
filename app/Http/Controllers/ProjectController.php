<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index()
    {
        return Inertia::render('Home', [
            'projects' => Project::orderBy('created_at', 'desc')->get(),
        ]);
    }

    public function admin()
    {
        return Inertia::render('Admin', [
            'projects' => Project::with('user')->orderBy('created_at', 'desc')->get(),
            'users' => User::orderBy('name')->get(['id', 'name', 'email']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:template,userfile',
            'user_id' => 'nullable|integer|exists:users,id',
            'glb_file' => 'nullable|file|max:51200',
            'json_file' => 'nullable|file|max:10240',
            'cover_image' => 'nullable|image|max:5120',
        ]);

        $project = Project::create([
            'name' => $request->name,
            'type' => $request->type,
            'user_id' => $request->user_id,
        ]);

        $data = $this->storeFiles($request, $project->id);
        if (!empty($data)) {
            $project->update($data);
        }

        return redirect()->route('admin')->with('success', 'Project created.');
    }

    public function update(Request $request, Project $project)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:template,userfile',
            'user_id' => 'nullable|integer|exists:users,id',
            'glb_file' => 'nullable|file|max:51200',
            'json_file' => 'nullable|file|max:10240',
            'cover_image' => 'nullable|image|max:5120',
        ]);

        $data = ['name' => $request->name, 'type' => $request->type, 'user_id' => $request->user_id];

        if ($request->hasFile('glb_file') && $project->glb_url) {
            Storage::disk('public')->delete($project->glb_url);
        }
        if ($request->hasFile('json_file') && $project->json_url) {
            Storage::disk('public')->delete($project->json_url);
        }
        if ($request->hasFile('cover_image') && $project->cover_image) {
            Storage::disk('public')->delete($project->cover_image);
        }

        $data = array_merge($data, $this->storeFiles($request, $project->id));
        $project->update($data);

        return redirect()->route('admin')->with('success', 'Project updated.');
    }

    public function destroy(Project $project)
    {
        Storage::disk('public')->deleteDirectory("projects/{$project->id}");
        $project->delete();

        return redirect()->route('admin')->with('success', 'Project deleted.');
    }

    private function storeFiles(Request $request, int $id): array
    {
        $disk = Storage::disk('public');
        $dir = "projects/{$id}";
        $data = [];

        if ($request->hasFile('glb_file')) {
            $data['glb_url'] = $disk->putFileAs($dir, $request->file('glb_file'), "{$id}.glb");
        }

        if ($request->hasFile('json_file')) {
            $data['json_url'] = $disk->putFileAs($dir, $request->file('json_file'), "{$id}.json");
        }

        if ($request->hasFile('cover_image')) {
            $ext = $request->file('cover_image')->getClientOriginalExtension();
            $data['cover_image'] = $disk->putFileAs($dir, $request->file('cover_image'), "{$id}.{$ext}");
        }

        return $data;
    }
}
