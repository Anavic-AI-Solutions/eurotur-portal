<?php

namespace Tests\Feature\Portal;

use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class MeetingRoomTest extends TestCase
{
    public function test_it_renders_the_meeting_room_page_with_the_calendar_embed(): void
    {
        Config::set('services.meeting_room.calendar_url', 'https://www.google.com/calendar/embed?src=calendar-id@group.calendar.google.com');
        Config::set('services.meeting_room.instructivo_url', 'https://drive.google.com/drive/folders/abc');

        $response = $this->get(route('portal.meeting-room'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('portal/meeting-room')
            ->where('calendarUrl', 'https://www.google.com/calendar/embed?src=calendar-id@group.calendar.google.com')
            ->where('instructivoUrl', 'https://drive.google.com/drive/folders/abc')
        );
    }

    public function test_it_renders_with_null_config_without_crashing(): void
    {
        Config::set('services.meeting_room.calendar_url', null);
        Config::set('services.meeting_room.instructivo_url', null);

        $response = $this->get(route('portal.meeting-room'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('portal/meeting-room')
            ->where('calendarUrl', null)
            ->where('instructivoUrl', null)
        );
    }
}
