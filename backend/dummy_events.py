from datetime import datetime
from uuid import uuid4

def get_dummy_events():
    def duration_str(start, end):
        delta = end - start
        total_minutes = delta.total_seconds() // 60
        if total_minutes < 1:
            return "instant"
        elif total_minutes < 60:
            return f"{int(total_minutes)} min"
        elif total_minutes % 60 == 0:
            return f"{int(total_minutes // 60)} hour"
        else:
            hours = int(total_minutes // 60)
            minutes = int(total_minutes % 60)
            return f"{hours} hr {minutes} min"

    return [
        {
            "id": 1,
            "title": "New subscriber on Twitch!",
            "description": "New subscriber on Twitch! Live event is happening now with limited seats. Join quickly to participate in real-time.",
            "source_app": "System",
            "location": "Cafeteria",
            "notification_id": str(uuid4()),
            "commitment_type": "meeting",
            "date_time": "2025-06-14T10:00:00",
            "created_at": "2025-06-14T10:00:00",
            "reminded": False,
            "duration": duration_str(datetime.fromisoformat("2025-06-14T10:00:00"), datetime.fromisoformat("2025-06-14T11:00:00")),
            "date_present": None,
            "deleted": False
        },
        {
            "id": 2,
            "title": "Team Standup Meeting",
            "description": "Daily team sync-up to discuss blockers and progress. Please be on time.",
            "source_app": "Slack",
            "location": "Zoom",
            "notification_id": str(uuid4()),
            "commitment_type": "meeting",
            "date_time": "2025-06-14T10:30:00",
            "created_at": "2025-06-14T10:30:00",
            "reminded": False,
            "duration": duration_str(datetime.fromisoformat("2025-06-14T10:30:00"), datetime.fromisoformat("2025-06-14T11:00:00")),
            "date_present": None,
            "deleted": False
        },
        {
            "id": 3,
            "title": "Web3 Panel Discussion",
            "description": "Industry leaders talk about the future of decentralized internet.",
            "source_app": "Eventbrite",
            "location": "Auditorium Hall A",
            "notification_id": str(uuid4()),
            "commitment_type": "event",
            "date_time": "2025-06-14T12:00:00",
            "created_at": "2025-06-14T12:00:00",
            "reminded": False,
            "duration": duration_str(datetime.fromisoformat("2025-06-14T12:00:00"), datetime.fromisoformat("2025-06-14T14:00:00")),
            "date_present": None,
            "deleted": False
        },
        {
            "id": 4,
            "title": "Office Birthday Bash",
            "description": "Celebrate Arjun's birthday with snacks, music, and fun games!",
            "source_app": "Calendar",
            "location": "Pantry Area",
            "notification_id": str(uuid4()),
            "commitment_type": "party",
            "date_time": "2025-06-14T16:00:00",
            "created_at": "2025-06-14T16:00:00",
            "reminded": False,
            "duration": duration_str(datetime.fromisoformat("2025-06-14T16:00:00"), datetime.fromisoformat("2025-06-14T17:30:00")),
            "date_present": None,
            "deleted": False
        },
        {
            "id": 5,
            "title": "Assignment Submission Deadline",
            "description": "Final project report due tonight. No late submissions allowed.",
            "source_app": "Classroom",
            "location": "Google Classroom",
            "notification_id": str(uuid4()),
            "commitment_type": "deadline",
            "date_time": "2025-06-14T23:59:00",
            "created_at": "2025-06-14T23:59:00",
            "reminded": False,
            "duration": duration_str(datetime.fromisoformat("2025-06-14T23:59:00"), datetime.fromisoformat("2025-06-15T00:00:00")),
            "date_present": None,
            "deleted": False
        },
        {
            "id": 6,
            "title": "Drink Water Reminder",
            "description": "Stay hydrated! It's been 2 hours since your last glass.",
            "source_app": "HealthSync",
            "location": "N/A",
            "notification_id": str(uuid4()),
            "commitment_type": "reminder",
            "date_time": "2025-06-14T11:00:00",
            "created_at": "2025-06-14T11:00:00",
            "reminded": False,
            "duration": "instant",
            "date_present": None,
            "deleted": False
        },
        {
            "id": 7,
            "title": "Clean Inbox",
            "description": "Sort and archive unread emails before the weekly sync.",
            "source_app": "Todoist",
            "location": "Desktop",
            "notification_id": str(uuid4()),
            "commitment_type": "task",
            "date_time": "2025-06-14T14:00:00",
            "created_at": "2025-06-14T14:00:00",
            "reminded": False,
            "duration": duration_str(datetime.fromisoformat("2025-06-14T14:00:00"), datetime.fromisoformat("2025-06-14T14:30:00")),
            "date_present": None,
            "deleted": False
        },
        {
            "id": 8,
            "title": "New Version Available",
            "description": "NotifSync v2.0 is now available. Update now for new features and bug fixes.",
            "source_app": "System",
            "location": "App Store",
            "notification_id": str(uuid4()),
            "commitment_type": "update",
            "date_time": "2025-06-14T13:00:00",
            "created_at": "2025-06-14T13:00:00",
            "reminded": False,
            "duration": "instant",
            "date_present": None,
            "deleted": False
        },
        {
            "id": 9,
            "title": "Happy Friendship Day!",
            "description": "Celebrate the people who've stood by you. Send a message now!",
            "source_app": "Messages",
            "location": "WhatsApp",
            "notification_id": str(uuid4()),
            "commitment_type": "greeting",
            "date_time": "2025-06-14T09:00:00",
            "created_at": "2025-06-14T09:00:00",
            "reminded": False,
            "duration": "instant",
            "date_present": None,
            "deleted": False
        },
        {
            "id": 10,
            "title": "Data Structures Lecture",
            "description": "Week 5: Binary Trees and Heaps. Lecture starts at 2:30 PM sharp.",
            "source_app": "MyUniversity",
            "location": "Lecture Hall B2",
            "notification_id": str(uuid4()),
            "commitment_type": "education",
            "date_time": "2025-06-14T14:30:00",
            "created_at": "2025-06-14T14:30:00",
            "reminded": False,
            "duration": duration_str(datetime.fromisoformat("2025-06-14T14:30:00"), datetime.fromisoformat("2025-06-14T16:00:00")),
            "date_present": None,
            "deleted": False
        },
        {
            "id": 11,
            "title": "Mindfulness Session",
            "description": "Take 10 minutes to breathe, relax, and reflect. Your mental health matters.",
            "source_app": "Headspace",
            "location": "Meditation App",
            "notification_id": str(uuid4()),
            "commitment_type": "wellness",
            "date_time": "2025-06-14T15:00:00",
            "created_at": "2025-06-14T15:00:00",
            "reminded": False,
            "duration": duration_str(datetime.fromisoformat("2025-06-14T15:00:00"), datetime.fromisoformat("2025-06-14T15:15:00")),
            "date_present": None,
            "deleted": False
        }
    ]
