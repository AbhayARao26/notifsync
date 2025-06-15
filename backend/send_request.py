import requests
import os
import json
import sys

def send_xml_file():
    # Get the absolute path to the XML file
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)  # Only go up one level to reach notifsync
    xml_path = os.path.join(project_root, "notifications_dataset.xml")
    
    # Check if file exists
    if not os.path.exists(xml_path):
        print(f"Error: File not found at {xml_path}")
        return
    
    print(f"Found XML file at: {xml_path}")
    
    # Prepare the file for upload
    try:
        with open(xml_path, 'rb') as f:
            files = {
                'file': ('notifications_dataset.xml', f, 'application/xml')
            }
            
            print("Sending request to server...")
            response = requests.post(
                'http://localhost:8000/process-notifications',
                files=files
            )
            
            # Print the response
            print("\nStatus Code:", response.status_code)
            
            try:
                response_data = response.json()
                print("Response:", json.dumps(response_data, indent=2))
            except json.JSONDecodeError:
                print("Raw Response:", response.text)
            
            if response.status_code != 200:
                print("\nError occurred while processing the request.")
                if 'detail' in response_data:
                    print("Error details:", response_data['detail'])
    
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the server. Make sure the server is running at http://localhost:8000")
    except Exception as e:
        print(f"Error occurred: {str(e)}")

if __name__ == "__main__":
    send_xml_file() 