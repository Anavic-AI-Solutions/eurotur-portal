<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class MeetingRoomController extends Controller
{
    /**
     * Sala de Reuniones: the Google Calendar embed used for room booking.
     */
    public function __invoke(): Response
    {
        return Inertia::render('portal/meeting-room', [
            'calendarUrl' => config('services.meeting_room.calendar_url'),
            'instructivoUrl' => config('services.meeting_room.instructivo_url'),
        ]);
    }
}
