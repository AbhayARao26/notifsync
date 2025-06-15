# NotifSync

NotifSync is a desktop application that synchronizes and manages notifications across different platforms. It provides a unified interface to view, manage, and organize notifications from various sources.

## Features

- 📅 Calendar view of notifications
- ⏰ Timeline view with conflict detection
- 🗑️ Trash bin for deleted notifications
- 🌓 Dark/Light mode support
- 🔍 Search functionality
- 📱 Cross-platform support (Windows, macOS, Linux)

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Python FastAPI
- **Desktop Wrapper**: Tauri
- **Data Storage**: JSON (with Pydantic validation)
- **Styling**: CSS-in-JS

## Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- Rust (for Tauri build)
- System-specific build tools:
  - Windows: Microsoft Visual Studio C++ Build Tools
  - macOS: Xcode Command Line Tools
  - Linux: Build essentials and libwebkit2gtk

## Windows Setup Guide (First Time)

### 1. Install Node.js
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Choose the LTS (Long Term Support) version
3. Run the installer and follow the installation wizard
4. Verify installation by opening Command Prompt and running:
   ```bash
   node --version
   npm --version
   ```

### 2. Install Python
1. Download Python from [python.org](https://www.python.org/downloads/)
2. Run the installer
3. **Important**: Check "Add Python to PATH" during installation
4. Verify installation:
   ```bash
   python --version
   pip --version
   ```

### 3. Install Rust
1. Download Rust installer from [rustup.rs](https://rustup.rs/)
2. Run the installer (rustup-init.exe)
3. Choose option 1 for default installation
4. Verify installation:
   ```bash
   rustc --version
   cargo --version
   ```

### 4. Install Visual Studio Build Tools
1. Download Visual Studio Build Tools from [Visual Studio Downloads](https://visualstudio.microsoft.com/downloads/)
2. Run the installer
3. Select "Desktop development with C++"
4. Install the selected components

### 5. Install Git
1. Download Git from [git-scm.com](https://git-scm.com/download/win)
2. Run the installer with default settings
3. Verify installation:
   ```bash
   git --version
   ```

### 6. Clone and Setup Project
1. Open Command Prompt and navigate to your desired directory:
   ```bash
   cd C:\Users\YourUsername\Documents
   ```

2. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/notifsync.git
   cd notifsync
   ```

3. Create and activate Python virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```

4. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Install Node.js dependencies:
   ```bash
   npm install
   ```

### 7. Run the Application

1. Start the backend server (in one Command Prompt):
   ```bash
   cd backend
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. In a new Command Prompt, start the frontend:
   ```bash
   npm run dev
   ```

3. To run with Tauri (in a new Command Prompt):
   ```bash
   npm run tauri dev
   ```

### Troubleshooting Common Windows Issues

1. **"python not found" error**
   - Ensure Python is added to PATH
   - Restart Command Prompt
   - Try using `py` instead of `python`

2. **"node not found" error**
   - Restart Command Prompt
   - Reinstall Node.js with PATH option

3. **Build Tools errors**
   - Ensure Visual Studio Build Tools are installed
   - Run Command Prompt as Administrator
   - Restart computer after installation

4. **Rust installation issues**
   - Run `rustup update` to ensure latest version
   - Restart Command Prompt
   - Check system PATH variables

5. **Port 8000 already in use**
   - Find process using port: `netstat -ano | findstr :8000`
   - Kill process: `taskkill /PID <process_id> /F`
   - Or change port in `uvicorn` command

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/notifsync.git
cd notifsync
```

### 2. Backend Setup

#### Create and Activate Virtual Environment

**Windows:**
```bash
python -m venv venv
.\venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

#### Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
npm install
```

## Running the Application

### Development Mode

1. **Start the Backend Server**

```bash
# From the project root
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

2. **Start the Frontend Development Server**

```bash
# From the project root
npm run dev
```

3. **Build and Run with Tauri**

```bash
# From the project root
npm run tauri dev
```

### Production Build

1. **Build the Frontend**

```bash
npm run build
```

2. **Build the Desktop Application**

```bash
npm run tauri build
```

The built application will be available in the `src-tauri/target/release` directory.

## Project Structure

```
notifsync/
├── backend/
│   ├── main.py           # FastAPI application
│   ├── models.py         # Pydantic models
│   ├── dummy_events.py   # Sample events data
│   └── events.json       # Event storage
├── src/                  # Frontend source code
│   ├── components/       # React components
│   ├── App.jsx          # Main application
│   └── main.jsx         # Entry point
├── src-tauri/           # Tauri configuration
├── public/              # Static assets
├── index.html          # HTML entry point
├── package.json        # Node.js dependencies
└── requirements.txt    # Python dependencies
```

## Data Flow and Pydantic Integration

### Backend Data Processing

1. **Streaming Event Loading and Validation**
```python
class EventStore:
    def load_events(self):
        with open(EVENTS_FILE, "r") as f:
            # Skip the opening bracket
            f.read(1)
            
            while True:
                # Read until we find a complete JSON object
                event_str = ""
                bracket_count = 0
                in_string = False
                escape_next = False
                
                # Read character by character to find complete JSON objects
                while True:
                    char = f.read(1)
                    if not char:  # End of file
                        break
                    
                    event_str += char
                    # Track JSON object boundaries
                    if not in_string:
                        if char == '{':
                            bracket_count += 1
                        elif char == '}':
                            bracket_count -= 1
                            if bracket_count == 0:
                                break
                
                # Process the complete event
                try:
                    event_data = json.loads(event_str)
                    event = Event(**event_data)
                    self.events[event.id] = event
                except Exception as e:
                    print(f"Error parsing event: {str(e)}")
```

2. **Memory-Efficient Processing**:
   - Events are loaded one at a time from the JSON file
   - Only one event is in memory at any given time
   - Character-by-character reading for precise control
   - Handles large files with minimal memory usage

3. **Robust Error Handling**:
   - Each event is parsed independently
   - Detailed error messages with exact event data
   - Continues processing even if some events fail
   - Maintains data integrity

4. **Data Flow**:
   - JSON file is read character by character
   - Complete events are identified and extracted
   - Each event is validated using Pydantic
   - Valid events are stored in a dictionary for O(1) access
   - Invalid events are logged but don't break the application

5. **API Endpoints**:
   - `GET /api/events`: Returns all validated events
   - `POST /api/events`: Validates new event with Pydantic before storage
   - `PUT /api/events/{event_id}`: Validates updates with Pydantic
   - `DELETE /api/events/{event_id}`: Marks event as deleted
   - `DELETE /api/events/trash`: Removes deleted events

### Frontend Integration

1. **Data Fetching**:
```javascript
const fetchEvents = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/events`);
    if (!response.ok) throw new Error('Failed to fetch events');
    const data = await response.json();
    setEvents(data);
  } catch (error) {
    console.error('Error fetching events:', error);
  }
};
```

2. **Data Updates**:
   - Frontend sends data to backend endpoints
   - Backend validates with Pydantic before processing
   - Success/failure responses are handled appropriately

## API Endpoints

- `GET /api/events` - Get all events
- `POST /api/events` - Create a new event
- `PUT /api/events/{event_id}` - Update an event
- `DELETE /api/events/{event_id}` - Mark an event as deleted
- `DELETE /api/events/trash` - Clear the trash bin

## Data Model

Events are stored with the following structure:

```typescript
interface Event {
  id: number;
  title: string;
  description: string;
  date_time: string;
  location: string;
  source_app: string;
  notification_id: string;
  commitment_type: string;
  created_at: string;
  reminded: boolean;
  duration: string;
  date_present: string | null;
  deleted: boolean;
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Troubleshooting

### Common Issues

1. **Backend Connection Error**
   - Ensure the backend server is running on port 8000
   - Check if CORS is properly configured
   - Verify the API_BASE_URL in frontend code

2. **Build Errors**
   - Ensure all prerequisites are installed
   - Clear node_modules and reinstall dependencies
   - Check Rust toolchain installation

3. **Python Virtual Environment**
   - If you get "command not found" errors, ensure the virtual environment is activated
   - On Windows, use `.\venv\Scripts\activate`
   - On macOS/Linux, use `source venv/bin/activate`

### Getting Help

If you encounter any issues:
1. Check the [Issues](https://github.com/yourusername/notifsync/issues) page
2. Create a new issue with detailed information about your problem
3. Include system information and error messages

## Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://reactjs.org/)
- [Tauri](https://tauri.app/)
- [Pydantic](https://pydantic-docs.helpmanual.io/)
