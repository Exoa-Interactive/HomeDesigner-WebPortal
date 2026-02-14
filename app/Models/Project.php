<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'name',
        'glb_url',
        'json_url',
        'cover_image',
    ];
}
