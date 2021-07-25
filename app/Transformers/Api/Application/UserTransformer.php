<?php

namespace Pterodactyl\Transformers\Api\Application;

use Pterodactyl\Models\User;
use Pterodactyl\Services\Acl\Api\AdminAcl;

class UserTransformer extends BaseTransformer
{
    /**
     * List of resources that can be included.
     *
     * @var array
     */
    protected $availableIncludes = ['role', 'servers'];

    /**
     * Return the resource name for the JSONAPI output.
     */
    public function getResourceName(): string
    {
        return User::RESOURCE_NAME;
    }

    /**
     * Return a transformed User model that can be consumed by external services.
     */
    public function transform(User $model): array
    {
        return [
            'id' => $model->id,
            'external_id' => $model->external_id,
            'uuid' => $model->uuid,
            'username' => $model->username,
            'email' => $model->email,
            'first_name' => $model->name_first,
            'last_name' => $model->name_last,
            'language' => $model->language,
            'root_admin' => (bool) $model->root_admin,
            '2fa' => (bool) $model->use_totp,
            'avatar_url' => $model->avatarURL(),
            'admin_role_id' => $model->admin_role_id,
            'role_name' => $model->adminRoleName(),
            'created_at' => $this->formatTimestamp($model->created_at),
            'updated_at' => $this->formatTimestamp($model->updated_at),
        ];
    }

    /**
     * Return the role associated with this user.
     *
     * @return \League\Fractal\Resource\Item|\League\Fractal\Resource\NullResource
     *
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     * @throws \Pterodactyl\Exceptions\Transformer\InvalidTransformerLevelException
     */
    public function includeRole(User $user)
    {
        if (!$this->authorize(AdminAcl::RESOURCE_ROLES)) {
            return $this->null();
        }

        $user->loadMissing('adminRole');

        return $this->item($user->getRelation('adminRole'), $this->makeTransformer(AdminRoleTransformer::class), 'admin_role');
    }

    /**
     * Return the servers associated with this user.
     *
     * @return \League\Fractal\Resource\Collection|\League\Fractal\Resource\NullResource
     *
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     * @throws \Pterodactyl\Exceptions\Transformer\InvalidTransformerLevelException
     */
    public function includeServers(User $user)
    {
        if (!$this->authorize(AdminAcl::RESOURCE_SERVERS)) {
            return $this->null();
        }

        $user->loadMissing('servers');

        return $this->collection($user->getRelation('servers'), $this->makeTransformer(ServerTransformer::class), 'server');
    }
}
