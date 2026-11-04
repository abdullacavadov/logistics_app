<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

/** SPA authentication backed by Laravel's session cookie and Sanctum. */
class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:150',
            'phone' => ['required', 'string', 'regex:/^\+[1-9][0-9]{7,14}$/', 'unique:users,phone'],
            'email' => 'nullable|email|max:190|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'country_id' => 'required|integer|exists:countries,id',
            'role' => 'required|in:shipper,carrier,business_owner',
            'terms' => 'accepted',
        ]);

        // Validation guarantees an E.164 value (for example, +994501234567).
        $phone = $data['phone'];

        $user = DB::transaction(function () use ($data, $phone) {
            $user = User::create([
                'name' => $data['name'],
                'phone' => $phone,
                'email' => isset($data['email']) ? strtolower(trim($data['email'])) : null,
                'password' => $data['password'],
                'country_id' => $data['country_id'],
                'terms_accepted_at' => now(),
            ]);

            DB::table('user_roles')->insert([
                'user_id' => $user->id,
                'role' => $data['role'],
            ]);

            return $user;
        });

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return response()->json([
            'data' => ['user' => $user, 'roles' => $user->roles()],
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $field = filter_var($data['login'], FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';
        $loginValue = $field === 'email'
            ? strtolower(trim($data['login']))
            : '+' . preg_replace('/\D+/', '', $data['login']);

        $user = User::where($field, $loginValue)->first();

        // Support legacy accounts whose phone numbers were stored with spaces or punctuation.
        if (!$user && $field === 'phone') {
            $user = User::whereRaw(
                "REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', '') = ?",
                [$loginValue]
            )->first();

            if ($user) {
                $loginValue = $user->phone;
            }
        }

        if (!$user || $user->is_blocked) {
            return response()->json([
                'error' => [
                    'code' => $user ? 'account_blocked' : 'invalid_credentials',
                    'message' => $user ? 'Hesab bloklanıb' : 'Giriş məlumatları yanlışdır',
                ],
            ], $user ? 403 : 401);
        }

        if (!Auth::guard('web')->attempt([$field => $loginValue, 'password' => $data['password']])) {
            return response()->json([
                'error' => ['code' => 'invalid_credentials', 'message' => 'Giriş məlumatları yanlışdır'],
            ], 401);
        }

        $request->session()->regenerate();
        $user = $request->user();

        return response()->json([
            'data' => ['user' => $user, 'roles' => $user->roles()],
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'data' => ['user' => $request->user(), 'roles' => $request->user()->roles()],
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['data' => ['ok' => true]]);
    }
}
