<?php

use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Laravel\Sanctum\Http\Middleware\AuthenticateSession;
use Laravel\Sanctum\Sanctum;

$localStatefulDomains = [
    'localhost',
    'localhost:5173',
    '127.0.0.1',
    '127.0.0.1:5173',
];

$configuredStatefulDomains = array_filter(array_map(
    'trim',
    explode(',', (string) env('SANCTUM_STATEFUL_DOMAINS', ''))
));

return [
    'stateful' => array_values(array_unique(array_merge(
        $localStatefulDomains,
        $configuredStatefulDomains,
        [Sanctum::currentApplicationUrlWithPort()]
    ))),

    'guard' => ['web'],
    'expiration' => null,
    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    'middleware' => [
        'authenticate_session' => AuthenticateSession::class,
        'encrypt_cookies' => EncryptCookies::class,
        'validate_csrf_token' => ValidateCsrfToken::class,
    ],
];
