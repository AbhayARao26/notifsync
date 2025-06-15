from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import xmltodict
import json
from datetime import datetime
import os
import requests
import yaml
import logging
import chardet

# Logger setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnythingLLMClient:
    def __init__(self):
        with open("config.yaml", "r") as f:
            config = yaml.safe_load(f)

        self.api_key = config["api_key"]
        self.base_url = config["model_server_base_url"]
        self.workspace_slug = config["workspace_slug"]
        self.chat_url = f"{self.base_url}/workspace/{self.workspace_slug}/chat"
        self.headers = {
            "accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
        }

    def parse_notification_xml(self, xml_string: str) -> dict:
        prompt = f"""
You are an XML-to-JSON converter. Parse the following <notification> element and return a structured JSON object with exactly these fields:

**Required Fields:**
- `id`: Start with 1 and increment for each notification
- `title`: Content from first <text> element (strip "Details:" prefix if present).
- `description`: Content from second <text> element (keep "Details:" prefix intact).
- `date_time`: Value from `timestamp` attribute( in string format).
- `location`: Extract from second <text> element if mentioned, otherwise "null" (give in string format).
- `source_app`: Value from `source_app` attribute.
- `notification_id`: Value from `id` attribute.
- `commitment_type`: Classify as "meeting", "events", "party", "deadlines", "reminder","tasks","updates","greeting","education" or "other" based on context from the second <text> element.
- `reminded`: Always false.
- `duration`: Extract from second <text> element if mentioned (format: "X hours"/"X minutes"), default "1 hour".
- `date_present`: Extract any date/time from second <text> element in string format, otherwise "null" (give in string format).
- `deleted`: Always false. (give in string format)

**Rules:**
1. Extract values directly from XML attributes and nested <text> elements within <binding>.
2. For title: Use first <text> content, remove "Details:" prefix if present.
3. For description: Use second <text> content, preserve "Details:" prefix.
4. Use "null" (give in string format) for missing optional fields like location and date_present.
5. Return valid JSON only - no explanations or formatting.

**Input XML:**
{xml_string}
"""

        data = {
            "message": prompt,
            "mode": "chat",
            "sessionId": "notification-parser",
            "attachments": [],
        }

        try:
            res = requests.post(self.chat_url, headers=self.headers, json=data)
            res.raise_for_status()
            text = res.json().get("textResponse", "")
            if '```json' in text:
                text = text.split('```json')[1].split('```')[0]
            elif '```' in text:
                text = text.split('```')[1].split('```')[0]
            return json.loads(text)
        except Exception as e:
            logger.error(f"LLM error: {e}")
            return {}

@app.post("/process-notifications")
async def process_notifications(file: UploadFile = File(...)):
    try:
        content = await file.read()
        encoding = chardet.detect(content)['encoding']
        xml_content = content.decode(encoding or 'utf-8')

        try:
            xml_dict = xmltodict.parse(xml_content)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid XML: {e}")

        notifications = xml_dict.get("notifications", {}).get("notification", [])
        if not isinstance(notifications, list):
            notifications = [notifications]

        llm_client = AnythingLLMClient()
        output_path = "events.json"

        # Initialize JSON array file if empty
        if not os.path.exists(output_path):
            with open(output_path, "w", encoding="utf-8") as f:
                f.write("[]")

        processed_notifications = []

        for idx, notification in enumerate(notifications):
            single_xml = xmltodict.unparse({"notification": notification}, pretty=True)
            result = llm_client.parse_notification_xml(single_xml)

            if result:
                processed_notifications.append(result)
                
                try:
                    # Read current content
                    with open(output_path, "r", encoding="utf-8") as f:
                        current_data = json.load(f)

                    # Append new item
                    current_data.append(result)

                    # Write updated content
                    with open(output_path, "w", encoding="utf-8") as f:
                        json.dump(current_data, f, indent=2)

                except Exception as e:
                    logger.error(f"Error writing to file: {e}")
                    raise HTTPException(status_code=500, detail="Failed to write to JSON file")

        return {"processed_notifications": processed_notifications, "file_saved": output_path}

    except Exception as e:
        logger.error(f"Processing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))