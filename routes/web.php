<?php

use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;

Route::get('/', [ProjectController::class, 'index'])->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/admin', [ProjectController::class, 'admin'])->name('admin');
    Route::post('/admin/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::post('/admin/projects/{project}', [ProjectController::class, 'update'])->name('projects.update');
    Route::delete('/admin/projects/{project}', [ProjectController::class, 'destroy'])->name('projects.destroy');
});

require __DIR__.'/auth.php';
