<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/** TS §4: qeydiyyat, giriş, çıxış. Telefon/e-poçt təsdiqi və Google OAuth növbəti addımdır. */
class AuthController extends Controller
{
    public function register(Request $r)
    {
        $d = $r->validate([
            'name' => 'required|string|max:150',
            'phone' => 'required_without:email|nullable|string|max:30|unique:users,phone',
            'email' => 'required_without:phone|nullable|email|max:190|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'country_id' => 'required|integer|exists:countries,id',
            'role' => 'required|in:shipper,carrier,business_owner', // admin qeydiyyatdan keçə bilməz
            'terms' => 'accepted',
        ]);
        $user = DB::transaction(function () use ($d) {
            $u = User::create([
                'name' => $d['name'], 'phone' => $d['phone'] ?? null, 'email' => $d['email'] ?? null,
                'password' => $d['password'], 'country_id' => $d['country_id'], 'terms_accepted_at' => now(),
            ]);
            DB::table('user_roles')->insert(['user_id' => $u->id, 'role' => $d['role']]);
            return $u;
        });
        return response()->json(['data' => ['user' => $user, 'roles' => $user->roles(), 'token' => $user->createToken('api')->plainTextToken]], 201);
    }

    public function login(Request $r)
    {
        $d = $r->validate(['login' => 'required|string', 'password' => 'required|string']);
        $field = filter_var($d['login'], FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';
        $user = User::where($field, $d['login'])->first();
        if (!$user || !$user->password || !Hash::check($d['password'], $user->password))
            return response()->json(['error' => ['code' => 'invalid_credentials', 'message' => 'Giriş məlumatları yanlışdır']], 401);
        if ($user->is_blocked)
            return response()->json(['error' => ['code' => 'account_blocked', 'message' => 'Hesab bloklanıb']], 403);
        return response()->json(['data' => ['user' => $user, 'roles' => $user->roles(), 'token' => $user->createToken('api')->plainTextToken]]);
    }

    public function me(Request $r)
    {
        return response()->json(['data' => ['user' => $r->user(), 'roles' => $r->user()->roles()]]);
    }

    public function logout(Request $r)
    {
        $r->user()->currentAccessToken()->delete();
        return response()->json(['data' => ['ok' => true]]);
    }
}
