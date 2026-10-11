<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;

/**
 * LaravelのWelcome画面。
 *
 * http://localhost:8000
 * へアクセスしたときに表示する。
 */
Route::get('/', function () {
    return view('welcome');
});

/**
 * Login処理。
 *
 * Next.jsからEmail / Passwordを受け取り、
 * Laravel標準のSession Authenticationでログインする。
 *
 * Sanctum SPA認証では、
 * Personal Access Tokenを発行せずSession Cookieを使用する。
 */
Route::post(
    '/login',
    [
        AuthenticatedSessionController::class,
        'store',
    ]
)->name('login');

/**
 * Logout処理。
 *
 * Login中のUserのみ実行できる。
 */
Route::post(
    '/logout',
    [
        AuthenticatedSessionController::class,
        'destroy',
    ]
)
    ->middleware('auth')
    ->name('logout');
