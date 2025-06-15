from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Event(BaseModel):
    id: Optional[int] = None
    title: str
    description: str
    date_time: datetime
    location: str
    source_app: str
    notification_id: str
    commitment_type: str
    reminded: bool
    duration: str
    date_present: Optional[datetime] = None
    deleted: bool 