#!/usr/bin/env python3
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
import uvicorn
from dummy_events import get_dummy_events
from models import Event
import os
import json
from fastapi.encoders import jsonable_encoder
import threading
import time

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EVENTS_FILE = "events.json"

class EventStore:
    def __init__(self):
        self.events: Dict[int, Event] = {}
        self.last_mtime = None
        self.load_events()
        self.update_last_mtime()

    def update_last_mtime(self):
        if os.path.exists(EVENTS_FILE):
            self.last_mtime = os.path.getmtime(EVENTS_FILE)
        else:
            self.last_mtime = None

    def load_events(self):
        """Load events from file one by one with Pydantic validation"""
        if os.path.exists(EVENTS_FILE):
            with open(EVENTS_FILE, "r") as f:
                # Skip the opening bracket
                f.read(1)
                
                while True:
                    # Read until we find a complete JSON object
                    event_str = ""
                    bracket_count = 0
                    in_string = False
                    escape_next = False
                    
                    while True:
                        char = f.read(1)
                        if not char:  # End of file
                            break
                            
                        event_str += char
                        
                        if escape_next:
                            escape_next = False
                            continue
                            
                        if char == '\\':
                            escape_next = True
                            continue
                            
                        if char == '"' and not escape_next:
                            in_string = not in_string
                            continue
                            
                        if not in_string:
                            if char == '{':
                                bracket_count += 1
                            elif char == '}':
                                bracket_count -= 1
                                if bracket_count == 0:
                                    break
                            elif char == ',' and bracket_count == 0:
                                break
                    
                    if not event_str.strip():
                        break
                        
                    try:
                        # Clean up the event string
                        event_str = event_str.strip().rstrip(',')
                        if not event_str:
                            continue
                            
                        # Parse the event data
                        event_data = json.loads(event_str)
                        
                        # Handle date_present special case
                        if isinstance(event_data.get("date_present"), str) and event_data["date_present"].lower() in ("na", "n/a", ""):
                            event_data["date_present"] = None
                        
                        # Update reminded status to true if it was false
                        if not event_data.get("reminded", False):
                            event_data["reminded"] = True
                        
                        # Create Pydantic model for each event
                        event = Event(**event_data)
                        self.events[event.id] = event
                    except Exception as e:
                        print(f"Error parsing event: {str(e)}\nEvent data: {event_str}")
                        
                    # Skip the comma and whitespace
                    f.read(1)
        else:
            # Initialize with dummy events if file doesn't exist
            for event_data in get_dummy_events():
                try:
                    # Update reminded status to true if it was false
                    if not event_data.get("reminded", False):
                        event_data["reminded"] = True
                    event = Event(**event_data)
                    self.events[event.id] = event
                except Exception as e:
                    print(f"Error parsing dummy event {event_data.get('id')}: {str(e)}")
            self.save_events()
        self.update_last_mtime()

    def save_events(self):
        """Save events to file"""
        with open(EVENTS_FILE, "w") as f:
            f.write("[\n")  # Start array
            events_list = list(self.events.values())
            for i, event in enumerate(events_list):
                # Convert event to JSON and write it
                event_json = json.dumps(jsonable_encoder(event), indent=2)
                f.write(event_json)
                if i < len(events_list) - 1:
                    f.write(",\n")
                else:
                    f.write("\n")
            f.write("]")  # End array

    def get_all_events(self) -> List[Event]:
        """Get all events as a list"""
        return list(self.events.values())

    def get_event(self, event_id: int) -> Optional[Event]:
        """Get a single event by ID"""
        return self.events.get(event_id)

    def add_event(self, event: Event) -> Event:
        """Add a new event"""
        if event.id is None:
            event.id = max(self.events.keys(), default=0) + 1
        self.events[event.id] = event
        self.save_events()
        return event

    def update_event(self, event_id: int, event: Event) -> Optional[Event]:
        """Update an existing event"""
        if event_id in self.events:
            event.id = event_id
            self.events[event_id] = event
            self.save_events()
            return event
        return None

    def delete_event(self, event_id: int) -> Optional[Event]:
        """Mark an event as deleted"""
        if event_id in self.events:
            self.events[event_id].deleted = True
            self.save_events()
            return self.events[event_id]
        return None

    def clear_trash(self) -> None:
        """Remove all deleted events"""
        self.events = {id: event for id, event in self.events.items() if not event.deleted}
        self.save_events()

# Initialize event store
event_store = EventStore()

def watch_events_file(event_store: EventStore, interval: int = 30):
    while True:
        time.sleep(interval)
        if os.path.exists(EVENTS_FILE):
            mtime = os.path.getmtime(EVENTS_FILE)
            if mtime != event_store.last_mtime:
                print("Detected change in events.json, reloading events...")
                event_store.load_events()

@app.on_event("startup")
def start_watcher():
    watcher_thread = threading.Thread(target=watch_events_file, args=(event_store,), daemon=True)
    watcher_thread.start()

@app.get("/api/events")
async def get_events():
    return event_store.get_all_events()

@app.post("/api/events")
async def create_event(event: Event):
    return event_store.add_event(event)

@app.put("/api/events/{event_id}")
async def update_event(event_id: int, event: Event):
    updated_event = event_store.update_event(event_id, event)
    if updated_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return updated_event

@app.delete("/api/events/trash")
async def clear_trash():
    event_store.clear_trash()
    return {"detail": "Trash cleared"}

@app.delete("/api/events/{event_id}")
async def delete_event(event_id: int):
    deleted_event = event_store.delete_event(event_id)
    if deleted_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return deleted_event

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 