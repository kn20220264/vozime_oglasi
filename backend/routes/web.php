<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/email/verify/{id}/{hash}', function ($id, $hash) {
    $query = request()->getQueryString();
    return redirect("http://localhost:5173/email/verify/{$id}/{$hash}?{$query}");
});