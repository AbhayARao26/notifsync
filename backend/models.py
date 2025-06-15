from pydantic import BaseModel
from typing import Optional

class Event(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    date_time: str  # Store as string
    location: Optional[str] = "N/A"
    source_app: str
    notification_id: str
    commitment_type: str
    reminded: str = "false"  # Store as string with default
    duration: str
    date_present: Optional[str] = None  # Store as string
    deleted: str = "false"  # Store as string with default

    def __str__(self):
        return f"{self.title} - {self.date_time}" 