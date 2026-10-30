<?php
namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable, SoftDeletes;

    protected $fillable = ['name', 'phone', 'email', 'password', 'google_id', 'country_id', 'terms_accepted_at'];
    protected $hidden = ['password', 'remember_token', 'google_id'];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_blocked' => 'boolean',
            'phone_verified_at' => 'datetime',
            'email_verified_at' => 'datetime',
            'terms_accepted_at' => 'datetime',
        ];
    }

    public function roles(): array
    {
        return \DB::table('user_roles')->where('user_id', $this->id)->pluck('role')->all();
    }
}
