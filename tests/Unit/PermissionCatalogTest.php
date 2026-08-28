<?php

namespace Tests\Unit;

use App\Enums\EditableSector;
use App\Enums\Permission;
use PHPUnit\Framework\TestCase;

class PermissionCatalogTest extends TestCase
{
    public function test_every_editable_sector_has_a_matching_permission(): void
    {
        foreach (EditableSector::cases() as $sector) {
            $this->assertSame(
                "sector.{$sector->value}.edit",
                Permission::forSector($sector)->value,
            );
        }

        $this->assertCount(count(EditableSector::cases()), Permission::sectorPermissions());
    }

    public function test_every_permission_declares_a_label_and_a_known_group(): void
    {
        $groups = array_keys(Permission::groupLabels());

        foreach (Permission::cases() as $permission) {
            $this->assertNotSame('', $permission->label());
            $this->assertContains($permission->group(), $groups);
        }
    }

    public function test_content_permissions_exclude_the_administration_group(): void
    {
        foreach (Permission::contentPermissions() as $permission) {
            $this->assertNotSame('administracion', $permission->group());
        }

        $this->assertNotContains(Permission::UsersManage, Permission::contentPermissions());
        $this->assertNotContains(Permission::RolesManage, Permission::contentPermissions());
    }

    public function test_values_returns_every_slug(): void
    {
        $this->assertCount(count(Permission::cases()), Permission::values());
        $this->assertContains(Permission::SearchAdmin->value, Permission::values());
    }
}
