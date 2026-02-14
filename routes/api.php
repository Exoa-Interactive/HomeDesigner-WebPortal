<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProjectApiController;
use Illuminate\Support\Facades\Route;

// Auth (public)
Route::post('/login', [AuthController::class, 'login']);

// Auth-protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/my-projects', [ProjectApiController::class, 'myProjects']);
});

// Public project CRUD
Route::get('/projects', [ProjectApiController::class, 'index']);
Route::get('/projects/{project}', [ProjectApiController::class, 'show']);
Route::post('/projects', [ProjectApiController::class, 'store']);
Route::post('/projects/{project}', [ProjectApiController::class, 'update']);
Route::delete('/projects/{project}', [ProjectApiController::class, 'destroy']);
