<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProjectApiController extends Controller
{
    public function index()
    {
        return response()->json(
            Project::orderBy('created_at', 'desc')->get()->map(fn ($a) => $this->formatProject($a))
        );
    }

    public function show(Project $project)
    {
        return response()->json($this->formatProject($project));
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

        return response()->json($this->formatProject($project->fresh()), 201);
    }

    public function update(Request $request, Project $project)
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|string|in:template,userfile',
            'user_id' => 'nullable|integer|exists:users,id',
            'glb_file' => 'nullable|file|max:51200',
            'json_file' => 'nullable|file|max:10240',
            'cover_image' => 'nullable|image|max:5120',
        ]);

        $data = [];

        if ($request->has('name')) {
            $data['name'] = $request->name;
        }

        if ($request->has('type')) {
            $data['type'] = $request->type;
        }

        if ($request->has('user_id')) {
            $data['user_id'] = $request->user_id;
        }

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

        return response()->json($this->formatProject($project->fresh()));
    }

    public function myProjects(Request $request)
    {
        return response()->json(
            Project::where('user_id', $request->user()->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(fn ($a) => $this->formatProject($a))
        );
    }

    public function destroy(Project $project)
    {
        Storage::disk('public')->deleteDirectory("projects/{$project->id}");
        $project->delete();

        return response()->json(['message' => 'Project deleted.']);
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

    private function formatProject(Project $project): array
    {
        return [
            'id' => $project->id,
            'name' => $project->name,
            'type' => $project->type,
            'user_id' => $project->user_id,
            'glb_url' => $project->glb_url ? Storage::disk('public')->url($project->glb_url) : null,
            'json_url' => $project->json_url ? Storage::disk('public')->url($project->json_url) : null,
            'cover_image' => $project->cover_image ? Storage::disk('public')->url($project->cover_image) : null,
            'created_at' => $project->created_at,
            'updated_at' => $project->updated_at,
        ];
    }
}
