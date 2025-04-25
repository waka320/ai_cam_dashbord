# Purpose-Based Dashboard Web Application Specification

## Links

- [前ダッシュボード](http://35.73.95.100:81/)
- [フロントデプロイ先](https://ai-cam-dashbord.vercel.app/)
- [デザイン(figma)](https://www.figma.com/design/C8bbdecPpwqYXlfJxEWouf/Untitled?node-id=0-1&t=zrU2JK2cVNs5sWGY-1)

## 1. Product Overview

### 1.1. Concept

This product is a purpose-based dashboard developed as part of the "Takayama City Data Local Production and Consumption Project" by the Yasuda-Endo-Urata Laboratory. It is designed to enable shop owners in the shopping district to utilize pedestrian flow data collected by AI cameras.

The product specifically addresses the challenge that business owners face: "not knowing how to use data effectively." It employs a solution approach of "first having users input their purpose, then showing appropriate data." As a tool for regional DX promotion, it provides multiple visualization functions and an intuitive interface.

### 1.2. Target Users

- Shop owners in Takayama City shopping district (primary target)
- Tourism-related businesses
- Local government officials in tourism and commerce departments
- Regional business owners considering data utilization

### 1.3. Value Proposition

- User-friendly interface that lowers the barrier to data utilization
- Purpose-driven data presentation for decision support
- Visualization of pedestrian flow data to optimize commercial activities
- Support for DX promotion and sales growth for regional businesses

## 2. Technology Stack

### 2.1. Frontend

- **Framework:** React.js + Next.js
- **UI Library:** Material-UI (MUI)
- **State Management:** Context API (CalendarContext)
- **Styling:** MUI theme and custom CSS
- **UI/Components:** Calendar, heatmaps, etc.
- **Media Queries:** Responsive design
- **Icons:** Material-UI icons
- **Build System:** Node.js v22.x

### 2.2. Backend

- **Framework:** FastAPI (Python 3.12)
- **Data Processing:** Custom analysis services (analyze/)
- **AI Features:** AI service (ai_service.py, ai_service_debug.py)
- **Data Visualization:** Histogram generation, heatmaps, etc.
- **Highlight Feature:** highlighter_service.py
- **Server:** Uvicorn + Nginx

### 2.3. Data Sources

- **Data Format:** CSV files
- **Acquisition Method:** CSV data retrieval from external API (fetch_csv.py)
- **Storage Location:** Local directory structure
- **External Integration:** AWS S3 data retrieval (for exmeidai)

### 2.4. Infrastructure

- **Frontend:** Vercel (hosting)
- **Backend:** AWS EC2 instance
- **CI/CD:** GitHub Actions
- **API Integration:** Gemini API (for AI service)
- **Reverse Proxy:** Nginx

## 3. Deployment Configuration

### 3.1. Frontend Deployment (Vercel)

- **Automatic Deployment:** GitHub Actions workflow (ci_front.yaml)
- **Build Process:**
  - Node.js 22.x setup
  - Install dependencies (npm ci)
  - Execute build (npm run build)
  - Automatic deployment to Vercel
- **Environment Variables:** Configured in Vercel environment

### 3.2. Backend Deployment (AWS EC2)

- **Automatic Deployment:** GitHub Actions workflow (ci_back.yaml)
- **Deployment Process:**
  - Transfer code to EC2 instance via SSH
  - Update Python virtual environment
  - Install dependencies
  - Restart Uvicorn server (port 8000)
  - Check and reload Nginx configuration
- **Runtime Environment:** Python 3.12 virtual environment
- **Error Logs:** app.log file

### 3.3. System Architecture Diagram

```
[User] --> [Vercel (Frontend)] --> [AWS EC2 (Backend API)] --> [CSV Data Store]
                                 |
                                 v
                           [Gemini API]
```

## 4. Directory Structure

```
.
├── backend/                      # Backend code
│   ├── app/                      # Main application
│   │   ├── api/                  # API definitions
│   │   │   └── endpoints/        # API endpoints
│   │   │       ├── csv_analysis.py       # CSV analysis API
│   │   │       ├── fetch_csv_exmeidai.py # Extended data retrieval
│   │   │       ├── fetch_csv.py          # CSV data retrieval
│   │   │       ├── get_graph.py          # Graph data generation
│   │   │       └── root.py               # Root endpoint
│   │   ├── core/                 # Core settings
│   │   │   └── config.py         # Application configuration
│   │   ├── services/             # Business logic
│   │   │   ├── ai_service.py     # AI advice generation
│   │   │   ├── ai_service_debug.py # Debug AI service
│   │   │   ├── highlighter_service.py # Data highlighting
│   │   │   └── analyze/          # Data analysis services
│   │   │       ├── analyze_event.py        # Event analysis
│   │   │       ├── analyze_weather.py      # Weather analysis
│   │   │       ├── generate_histograms.py  # Histogram generation
│   │   │       ├── get_data_for_calendar.py # Calendar data
│   │   │       ├── get_data_for_date_time.py # Date×time data
│   │   │       └── get_data_for_week_time.py # Weekday×time data
│   │   ├── main.py               # Application entry point
│   │   └── models.py             # Data model definitions
│   ├── requirements.txt          # Dependencies
│   ├── run.py                    # Execution script
│   └── vercel.json               # Vercel deployment settings
│
├── frontend/                     # Frontend code
│   ├── public/                   # Static files
│   │   ├── assets/               # Images and other assets
│   │   ├── fonts/                # Font files
│   │   └── index.html            # HTML entry point
│   ├── src/                      # Source code
│       ├── components/           # React components
│       │   ├── common/           # Common components
│       │   │   ├── Calendar.js           # Calendar view
│       │   │   ├── CongestionLegend.js   # Congestion legend
│       │   │   ├── DateTimeHeatmap.js    # Date×time heatmap
│       │   │   ├── HeatmapPopper.js      # Popup
│       │   │   ├── Inputs.js             # Input components
│       │   │   ├── SelectionControls.js  # Selection controls
│       │   │   └── TimeHeatmap.js        # Time heatmap
│       │   ├── layout/           # Layout components
│       │   │   ├── AISection.js          # AI analysis section
│       │   │   ├── Content.js            # Main content
│       │   │   └── Header.js             # Header
│       │   └── ui/               # UI components
│       ├── contexts/             # React contexts
│       │   └── CalendarContext.js # Data and state management
│       ├── styles/               # CSS styles
│       └── theme/                # Theme settings
│           └── theme.js          # MUI theme definition
│
├── .github/workflows/            # GitHub Actions workflows
│   ├── ci_back.yaml              # Backend CI/CD configuration
│   └── ci_front.yaml             # Frontend CI/CD configuration
│
└── vercel.json                   # Project-level Vercel settings
```

## 5. Major Frontend Components

### 5.1. Visualization Components

| Component | Purpose | Key Features |
|--------------|------|---------|
| `Calendar.js` | Monthly calendar format display | Displays congestion of each day in the month as a heatmap, highlighting features, detail popup |
| `TimeHeatmap.js` | Weekday×time display | Congestion matrix by weekday and time combination, highlighting features |
| `DateTimeHeatmap.js` | Date×time display | Detailed congestion by date and time for a specific month, highlighting features |
| `CongestionLegend.js` | Congestion legend | Definition and display of congestion levels 1-10 color scale |

### 5.2. Input and Control Components

| Component | Purpose | Key Features |
|--------------|------|---------|
| `Inputs.js` | Measurement location selection | Dropdown to select from 9 measurement locations in Takayama City |
| `SelectionControls.js` | Display controls | Location, display type, year/month selection, reset functionality |
| `HeatmapPopper.js` | Detail display | Popup on cell click, responsive design |

### 5.3. Layout Components

| Component | Purpose | Key Features |
|--------------|------|---------|
| `Header.js` | Header display | Navigation, purpose selection UI |
| `Content.js` | Main content | Layout for visualization components and AI section |
| `AISection.js` | AI analysis display | Display of AI data analysis results, interactive features |

## 6. Backend API Design

### 6.1. Public Endpoints

| Endpoint | Method | Description | Parameters |
|--------------|---------|------|-----------|
| `/api/get-graph` | POST | Graph data retrieval | location, year, month, action |
| `/api/fetch-csv` | GET | CSV data retrieval | None (internal processing) |
| `/api/fetch-csv-exmeidai` | GET | Extended data retrieval | None (internal processing) |
| `/api/analyze-csv` | POST | CSV analysis execution | csvData, question |

### 6.2. Service Layer

| Service | Purpose | Key Features |
|---------|------|---------|
| `ai_service.py` | AI advice generation | CSV data analysis, purpose-specific advice generation, Gemini API integration |
| `highlighter_service.py` | Data highlighting | Emphasis of data points according to purpose, multiple strategies |
| `analyze/` modules | Data analysis | Generation and analysis of calendar, time period, weekday data |

## 7. CI/CD Configuration

### 7.1. Backend CI/CD (ci_back.yaml)

- **Trigger:** Push to main branch
- **Process:**
  1. Python 3.12 setup in Ubuntu environment
  2. Install dependencies and testing
  3. AWS credential configuration
  4. SSH key installation
  5. SCP transfer of backend code to EC2
  6. Execute deployment script on EC2:
     - Update Python virtual environment
     - Install dependencies
     - Restart Uvicorn server
     - Check and reload Nginx configuration

### 7.2. Frontend CI/CD (ci_front.yaml)

- **Trigger:** Push to main branch
- **Process:**
  1. Node.js 22.x setup in Ubuntu environment
  2. NPM cache configuration
  3. Next.js build cache configuration
  4. Install dependencies
  5. Build Next.js application
  6. Automatic deployment to Vercel (upon Vercel integration)

## 8. Technical Challenges and Improvements

### 8.1. Frontend Challenges

- **Code duplication and separation:** Duplicate similar code between visualization components
- **State management centralization:** CalendarContext has grown too large
- **Error handling enhancement:** Minimal error display to users
- **Performance optimization:** Insufficient consideration for large data processing
- **Accessibility improvements:** Lack of consideration for color vision characteristics
- **Responsive design improvements:** Enhance viewing experience on small screens
- **Component testing deficiency:** Introduction of test code required

### 8.2. Backend Challenges

- **Data management optimization:** Consider migration from CSV file-based to database
- **Code duplication resolution:** Integration of similar services
- **Error handling enhancement:** More systematic error handling
- **Configuration management improvement:** Externalization of hardcoded settings
- **Testing enhancement:** Increase test coverage

### 8.3. Infrastructure Challenges

- **EC2 instance management:** Consider scaling and availability
- **Deployment process improvement:** Consider blue/green deployment strategies
- **Monitoring enhancement:** Introduce application and infrastructure monitoring
- **Backup and recovery strategy:** Consider data preservation measures

## 9. Future Development Plans

### 9.1. Short-term Goals

- UI/UX improvements and optimization
- Addition of new data sources
- Enhancement of data analysis features
- Implementation of user feedback

### 9.2. Medium to Long-term Goals

- Expansion to other regions (already initiated in Endoji Shopping District, Aichi Prefecture)
- Expansion of user base (addition of tourist-oriented features)
- Improvement of data management through database implementation
- Enhancement of AI prediction features

---

This specification will be updated regularly as development progresses.

---
Perplexity の Eliot より: pplx.ai/share
