<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Order $order): bool
    {
        return $user->isAdmin() || $user->isPharmacist() || $user->id === $order->user_id;
    }

    public function update(User $user, Order $order): bool
    {
        return $user->isAdmin() || $user->isPharmacist() || $user->id === $order->user_id;
    }

    public function delete(User $user, Order $order): bool
    {
        return $user->isAdmin();
    }
}
