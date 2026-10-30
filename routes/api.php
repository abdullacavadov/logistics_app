<?php
use App\Http\Controllers\Api\V1\ApplicationController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\LoadController;
use App\Http\Controllers\Api\V1\VehicleController;
use App\Http\Controllers\Api\V1\VehicleOfferController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('auth/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('auth/login', [AuthController::class, 'login'])->middleware('throttle:5,1');

    // Ictimai (qonaq) — yalnız dərc olunmuş elanlar
    Route::get('loads', [LoadController::class, 'index'])->middleware('throttle:60,1');
    Route::get('loads/{id}', [LoadController::class, 'show'])->whereNumber('id');

    Route::get('offers', [VehicleOfferController::class, 'index'])->middleware('throttle:60,1');

    Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::post('auth/logout', [AuthController::class, 'logout']);

        Route::get('my/loads', [LoadController::class, 'mine']);
        Route::post('loads', [LoadController::class, 'store']);
        Route::put('loads/{id}', [LoadController::class, 'update'])->whereNumber('id');
        Route::post('loads/{id}/publish', [LoadController::class, 'publish'])->whereNumber('id');
        Route::post('loads/{id}/cancel', [LoadController::class, 'cancel'])->whereNumber('id');
        Route::post('loads/{id}/archive', [LoadController::class, 'archive'])->whereNumber('id');

        Route::get('loads/{id}/matches', [LoadController::class, 'matches'])->whereNumber('id');

        Route::get('vehicles', [VehicleController::class, 'index']);
        Route::post('vehicles', [VehicleController::class, 'store']);
        Route::put('vehicles/{id}', [VehicleController::class, 'update'])->whereNumber('id');
        Route::delete('vehicles/{id}', [VehicleController::class, 'destroy'])->whereNumber('id');

        Route::get('my/offers', [VehicleOfferController::class, 'mine']);
        Route::post('offers', [VehicleOfferController::class, 'store']);
        Route::post('offers/{id}/activate', [VehicleOfferController::class, 'activate'])->whereNumber('id');
        Route::post('offers/{id}/cancel', [VehicleOfferController::class, 'cancel'])->whereNumber('id');
        Route::get('offers/{id}/matches', [VehicleOfferController::class, 'matches'])->whereNumber('id');

        Route::post('loads/{load}/applications', [ApplicationController::class, 'store'])->whereNumber('load');
    });
});
