<?php

namespace Tests\Feature;

use Tests\TenantTestCase;

class ExampleTest extends TenantTestCase
{
    public function test_returns_a_successful_response()
    {
        $response = $this->get(route('home'));

        $response->assertOk();
    }
}
