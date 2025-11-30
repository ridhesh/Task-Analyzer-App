# Smart Task Analyzer

An intelligent task prioritization system that helps users identify which tasks to work on first based on multiple factors.

## Features

- Smart Priority Scoring: Algorithm considers urgency, importance, effort, and dependencies
- Multiple Strategies: Choose between different prioritization approaches
- Bulk Task Import: Load multiple tasks via JSON
- Circular Dependency Detection: Automatically detects and warns about circular dependencies
- Responsive Design: Works on desktop and mobile devices
- Local Storage: Tasks persist between browser sessions

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run migrations:
```bash
python manage.py migrate
```

4. Start the development server:
```bash
python manage.py runserver
```

### Frontend Setup

The frontend is served directly by Django. Open your browser and navigate to:
```
http://127.0.0.1:8000
```

## Algorithm Explanation

The priority scoring algorithm uses a weighted approach with four components:

### 1. Urgency (40% default)
Based on due date proximity:
- Overdue: 1.0
- Due today: 0.9
- Tomorrow: 0.8
- 2-3 days: 0.6
- 4-7 days: 0.4
- More than 7 days: 0.2

### 2. Importance (30% default)
Normalized user rating (1-10 scale to 0-1)

### 3. Effort (20% default)
Inverse relationship with estimated hours:
- 1 hour or less: 1.0
- 1-4 hours: 0.7
- 4-8 hours: 0.4
- More than 8 hours: 0.2

### 4. Dependencies (10% default)
Tasks blocking others get higher priority

### Available Strategies

- Smart Balance: Balanced weighting of all factors
- Fastest Wins: Emphasizes low-effort tasks (50% weight)
- High Impact: Focuses on importance (60% weight)
- Deadline Driven: Prioritizes urgency (70% weight)

## API Endpoints

- POST /api/tasks/analyze/ - Analyze and sort tasks by priority
- POST /api/tasks/suggest/ - Get top 3 task recommendations

### API Behavior Note

The APIs return "405 Method Not Allowed" for GET requests - this is expected and correct behavior. The endpoints are designed to only accept POST requests with task data.

#### Correct Usage:
```bash
# POST requests work (expected)
curl -X POST http://127.0.0.1:8000/api/tasks/analyze/ \
  -H "Content-Type: application/json" \
  -d '[{"title": "Test", "due_date": "2024-12-15", "estimated_hours": 3, "importance": 8, "dependencies": []}]'

# GET requests fail (expected - this is correct)
curl -X GET http://127.0.0.1:8000/api/tasks/analyze/
```

## Design Decisions

### Algorithm Design
- Weighted Sum Approach: Chosen for transparency and configurability
- Normalized Scores: All components scaled to 0-1 for consistency
- Strategy Pattern: Different weighting strategies for flexibility

### Frontend Architecture
- Progressive Enhancement: Works even if backend is unavailable
- Local Storage: Data persistence without server dependency
- Responsive Design: Mobile-first approach with CSS Grid/Flexbox

### Error Handling
- Graceful Degradation: Falls back to local analysis if API fails
- User Feedback: Clear error messages and loading states
- Input Validation: Client-side validation with helpful messages

## Time Breakdown

- Algorithm Design & Backend: 2 hours
- Frontend Development: 1.5 hours
- Testing & Debugging: 1 hour
- Documentation: 0.5 hour

## Core Requirements Met

### Backend (Python/Django)
- Task model with all required fields
- Priority scoring algorithm with 4 factors
- API endpoints for analysis and suggestions
- Circular dependency detection
- Error handling and validation

### Frontend (HTML/CSS/JavaScript)
- Task input form with validation
- JSON bulk import
- Strategy selection (4 options)
- Priority visualization with color coding
- Responsive design
- Error handling and loading states

## Testing Guide

### Core Functionality Tests

#### Test 1: Basic Task Management
1. Add a single task using the form
2. Load sample tasks using the "Load Sample Tasks" button
3. Analyze tasks using the "Analyze Tasks" button
4. Verify tasks are sorted by priority score with color coding

#### Test 2: Strategy Switching
1. Test different strategies (Smart Balance, Fastest Wins, High Impact, Deadline Driven)
2. Verify each strategy produces different priority rankings
3. Confirm strategy changes are reflected in the analysis

#### Test 3: API Testing
1. Test POST /api/tasks/analyze/ with valid task data
2. Test POST /api/tasks/suggest/ with valid task data
3. Verify APIs return 200 status codes for valid requests
4. Confirm APIs return appropriate error codes for invalid requests

### Edge Case Tests
- Test form validation with invalid inputs
- Test JSON parsing with invalid JSON
- Test responsive design on different screen sizes
- Test data persistence after browser refresh

## Recent Updates

- Fixed backend API 500 errors
- Added comprehensive error handling and debug logging
- Made all navigation buttons functional
- Fixed notification display issues
- APIs now fully operational with proper strategy support

## Future Improvements

- User authentication and task persistence
- Advanced dependency visualization
- Machine learning for personalized weighting
- Integration with calendar systems
- Team collaboration features
- Export functionality for results

## Troubleshooting

### Common Issues

1. API not working: Application falls back to local analysis
2. Static files not loading: Check Django static file configuration
3. Database errors: Run python manage.py migrate

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

MIT License - feel free to use this project for your assessment!

## Demo Video

[Watch the demo video here] - Upload your video to YouTube, Google Drive, or Loom and add the link

## Testing Results

All API endpoints returning 200 SUCCESS:
- POST /api/tasks/analyze/ - Working
- POST /api/tasks/suggest/ - Working
- Multiple strategies supported - Working