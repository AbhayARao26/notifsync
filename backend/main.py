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
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EVENTS_FILE = "events.json"

class EventStore:
    def __init__(self):
        self.events: Dict[str, Event] = {}
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
            try:
                with open(EVENTS_FILE, "r") as f:
                    content = f.read().strip()
                    if not content or content == "[]":
                        self.events = {}
                        return
                    
                    # Remove the outer brackets and split by commas
                    content = content.strip("[]")
                    if not content:
                        self.events = {}
                        return
                        
                    # Split into individual event objects
                    event_strings = []
                    current_event = ""
                    bracket_count = 0
                    in_string = False
                    escape_next = False
                    
                    for char in content:
                        if escape_next:
                            current_event += char
                            escape_next = False
                            continue
                            
                        if char == '\\':
                            current_event += char
                            escape_next = True
                            continue
                            
                        if char == '"' and not escape_next:
                            in_string = not in_string
                            current_event += char
                            continue
                            
                        if not in_string:
                            if char == '{':
                                bracket_count += 1
                            elif char == '}':
                                bracket_count -= 1
                            elif char == ',' and bracket_count == 0:
                                event_strings.append(current_event.strip())
                                current_event = ""
                                continue
                                
                        current_event += char
                    
                    if current_event.strip():
                        event_strings.append(current_event.strip())
                    
                    # Process each event
                    for event_str in event_strings:
                        try:
                            if not event_str.strip():
                                continue
                                
                            # Parse the event data
                            event_data = json.loads(event_str)
                            
                            # Convert ID to string if it's an integer
                            if isinstance(event_data.get("id"), int):
                                event_data["id"] = str(event_data["id"])
                            
                            # Convert boolean values to strings
                            if isinstance(event_data.get("reminded"), bool):
                                event_data["reminded"] = str(event_data["reminded"]).lower()
                            if isinstance(event_data.get("deleted"), bool):
                                event_data["deleted"] = str(event_data["deleted"]).lower()
                            
                            # Handle date_present special case
                            if isinstance(event_data.get("date_present"), str) and event_data["date_present"].lower() in ("na", "n/a", "", "null"):
                                event_data["date_present"] = None
                            
                            # Create Pydantic model for each event
                            event = Event(**event_data)
                            self.events[event.id] = event
                        except Exception as e:
                            print(f"Error parsing event: {str(e)}\nEvent data: {event_str}")
            except Exception as e:
                print(f"Error reading events file: {str(e)}")
                self.events = {}
        else:
            # Initialize with dummy events if file doesn't exist
            for event_data in get_dummy_events():
                try:
                    # Convert ID to string if it's an integer
                    if isinstance(event_data.get("id"), int):
                        event_data["id"] = str(event_data["id"])
                    
                    # Convert boolean values to strings
                    if isinstance(event_data.get("reminded"), bool):
                        event_data["reminded"] = str(event_data["reminded"]).lower()
                    if isinstance(event_data.get("deleted"), bool):
                        event_data["deleted"] = str(event_data["deleted"]).lower()
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

    def get_event(self, event_id: str) -> Optional[Event]:
        """Get a single event by ID"""
        return self.events.get(event_id)

    def add_event(self, event: Event) -> Event:
        """Add a new event"""
        if event.id is None:
            event.id = max(self.events.keys(), default=0) + 1
        self.events[event.id] = event
        self.save_events()
        return event

    def update_event(self, event_id: str, event: Event) -> Optional[Event]:
        """Update an existing event"""
        if event_id in self.events:
            event.id = event_id
            self.events[event_id] = event
            self.save_events()
            return event
        return None

    def delete_event(self, event_id: str) -> Optional[Event]:
        """Mark an event as deleted"""
        if event_id in self.events:
            self.events[event_id].deleted = "true"
            self.save_events()
            return self.events[event_id]
        return None

    def clear_trash(self) -> None:
        """Remove all deleted events"""
        self.events = {id: event for id, event in self.events.items() if event.deleted == "false"}
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
async def update_event(event_id: str, event: Event):
    updated_event = event_store.update_event(event_id, event)
    if updated_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return updated_event

@app.delete("/api/events/trash")
async def clear_trash():
    event_store.clear_trash()
    return {"detail": "Trash cleared"}

@app.delete("/api/events/{event_id}")
async def delete_event(event_id: str):
    deleted_event = event_store.delete_event(event_id)
    if deleted_event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return deleted_event

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True) 