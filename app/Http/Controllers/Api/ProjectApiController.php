<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
        Log::info('[ProjectApi store] Incoming request', [
            'content_type'   => $request->header('Content-Type'),
            'content_length' => $request->header('Content-Length'),
            'all_fields'     => $request->except(['glb_file', 'json_file', 'cover_image']),
            'has_glb_file'   => $request->hasFile('glb_file'),
            'has_json_file'  => $request->hasFile('json_file'),
            'has_cover_image'=> $request->hasFile('cover_image'),
            'files'          => collect($request->allFiles())->map(fn($f) => [
                'original_name' => $f->getClientOriginalName(),
                'mime'          => $f->getMimeType(),
                'size_bytes'    => $f->getSize(),
                'error'         => $f->getError(),
            ])->toArray(),
            'php_post_max_size'       => ini_get('post_max_size'),
            'php_upload_max_filesize' => ini_get('upload_max_filesize'),
        ]);

        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:template,userfile',
            'user_id' => 'nullable|integer|exists:users,id',
            'glb_file' => 'nullable|file|max:51200',
            'json_file' => 'nullable|file|max:10240',
            'cover_image' => 'nullable|image|max:5120',
        ]);

        Log::info('[ProjectApi store] Validation passed');

        $project = Project::create([
            'name' => $request->name,
            'type' => $request->type,
            'user_id' => $request->user_id,
        ]);

        Log::info('[ProjectApi store] Project record created', ['project_id' => $project->id]);

        $data = $this->storeFiles($request, $project->id);
        if (!empty($data)) {
            $project->update($data);
        }

        Log::info('[ProjectApi store] Done', ['project_id' => $project->id, 'stored_paths' => $data]);

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

        Log::info('[ProjectApi storeFiles] Starting', [
            'project_id'      => $id,
            'storage_dir'     => $dir,
            'has_glb_file'    => $request->hasFile('glb_file'),
            'has_json_file'   => $request->hasFile('json_file'),
            'has_cover_image' => $request->hasFile('cover_image'),
        ]);

        if ($request->hasFile('glb_file')) {
            $file = $request->file('glb_file');
            Log::info('[ProjectApi storeFiles] Storing GLB', [
                'original_name' => $file->getClientOriginalName(),
                'mime'          => $file->getMimeType(),
                'size_bytes'    => $file->getSize(),
                'target'        => "{$dir}/{$id}.glb",
            ]);
            $path = $disk->putFileAs($dir, $file, "{$id}.glb");
            Log::info('[ProjectApi storeFiles] GLB result', ['path' => $path]);
            $data['glb_url'] = $path;
        }

        if ($request->hasFile('json_file')) {
            $file = $request->file('json_file');
            Log::info('[ProjectApi storeFiles] Storing JSON', [
                'original_name' => $file->getClientOriginalName(),
                'size_bytes'    => $file->getSize(),
            ]);
            $path = $disk->putFileAs($dir, $file, "{$id}.json");
            Log::info('[ProjectApi storeFiles] JSON result', ['path' => $path]);
            $data['json_url'] = $path;
        }

        if ($request->hasFile('cover_image')) {
            $file = $request->file('cover_image');
            $ext  = $file->getClientOriginalExtension();
            Log::info('[ProjectApi storeFiles] Storing cover image', [
                'original_name' => $file->getClientOriginalName(),
                'ext'           => $ext,
                'size_bytes'    => $file->getSize(),
            ]);
            $path = $disk->putFileAs($dir, $file, "{$id}.{$ext}");
            Log::info('[ProjectApi storeFiles] Cover image result', ['path' => $path]);
            $data['cover_image'] = $path;
        }

        Log::info('[ProjectApi storeFiles] Complete', ['data' => $data]);

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
