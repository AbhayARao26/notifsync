# NotifSync

A notification synchronization and management application.

## Setup

1. Create and activate a virtual environment:
```bash
python -m venv venv
.\venv\Scripts\activate  # On Windows
```

2. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

3. Install frontend dependencies:
```bash
npm install
```

## Running the Application

The application requires multiple components to run. Open separate terminal windows for each component:

### Terminal 1 - LLM Processing Server
```bash
.\venv\Scripts\activate
cd backend
uvicorn main_anythingllm:app --reload
```
This starts the LLM processing server on http://localhost:8000

### Terminal 2 - Request Sender
```bash
.\venv\Scripts\activate
cd backend
python send_requests.py
```
This handles sending requests to process notifications.

### Terminal 3 - Main Backend Server
```bash
.\venv\Scripts\activate
cd backend
python app.py
```
This starts the main backend server.

### Terminal 4 - Frontend Development
```bash
.\venv\Scripts\activate
npm run build
npm run tauri:dev
```
This builds and runs the frontend application.

## Configuration

1. Create a `config.yaml` file in the backend directory with your LLM API configuration:
```yaml
api_key: "your_api_key_here"
model_server_base_url: "your_model_server_url"
workspace_slug: "your_workspace_slug"
```

## Features

- Notification synchronization
- Event management
- Calendar integration
- Timeline view
- Trash management
- Dark/Light theme support

## Dependencies

### Backend
- FastAPI
- Pydantic
- XML processing
- LLM integration

### Frontend
- React
- Tauri
- Modern UI components
- Responsive design

## Troubleshooting

If you encounter any issues:
1. Ensure all terminals are running
2. Check that all ports are available
3. Verify your config.yaml settings
4. Check the console for error messages

## License

[Your License Here]
