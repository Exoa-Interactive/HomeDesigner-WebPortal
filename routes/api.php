<?php

use App\Http\Controllers\Api\ProjectApiController;
use Illuminate\Support\Facades\Route;

Route::get('/projects', [ProjectApiController::class, 'index']);
Route::get('/projects/{project}', [ProjectApiController::class, 'show']);
Route::post('/projects', [ProjectApiController::class, 'store']);
Route::post('/projects/{project}', [ProjectApiController::class, 'update']);
Route::delete('/projects/{project}', [ProjectApiController::class, 'destroy']);
