# Purpose-Based Dashboard Web Application Specification (README.md)

## 1. Product Overview

### 1.1. Concept

This product is a purpose-based dashboard developed as part of the “Data Local Production for Local Consumption Project in Takayama City” by the Endo & Urata Laboratory. It is designed to enable shopping district businesses to utilize human flow data collected by AI cameras.

To address the issue that “business operators don’t know what to do with data,” the system adopts an approach where users first input their purpose, and then appropriate data is presented. As a tool to promote regional digital transformation (DX), it offers multiple visualization functions and an intuitive interface.

### 1.2. Target Users

- Shopping district businesses in Takayama City (primary target)
- Tourism-related businesses
- Local government officials in charge of tourism and commerce
- Regional businesses considering data utilization

### 1.3. Value Proposition

- An easy-to-use interface that lowers the barrier to data utilization
- Decision-making support through data presentation based on user purpose
- Optimization of commercial activities through visualization of human flow data
- Support for regional business DX and sales improvement

## 2. Technology Stack

### 2.1. Frontend

- **Framework:** React.js
- **UI Library:** Material-UI (MUI)
- **State Management:** Context API (CalendarContext)
- **Styling:** MUI theme and custom CSS
- **UI/Components:** Calendar, heatmap, etc.
- **Media Queries:** Responsive design support
- **Icons:** Material-UI icons
- **Build System:** Node.js v22.x
- **URL State Management:** React Router, URLSearchParams

### 2.2. Backend

- **Framework:** FastAPI (Python 3.12)
- **Data Processing:** Custom analysis services (analyze/)
- **AI Functionality:** AI services (ai_service.py, ai_service_debug.py)
- **Data Visualization:** Histogram generation, heatmaps, etc.
- **Highlight Feature:** highlighter_service.py
- **Server:** Uvicorn + Nginx

### 2.3. Data Sources

- **Data Format:** CSV files
- **Acquisition Method:** Fetching CSV data from external APIs (fetch_csv.py)
- **Storage Location:** Local directory structure
- **External Integration:** Data acquisition from AWS S3 (for exmeidai)

### 2.4. Infrastructure

- **Frontend:** Vercel (hosting)
- **Backend:** AWS EC2 instance
- **CI/CD:** GitHub Actions
- **API Integration:** Gemini API (for AI services)
- **Reverse Proxy:** Nginx

## 3. Functional Requirements

### 3.1. Core Features

- **Purpose-based View Switching:** Display data according to the user’s purpose
- **Calendar Visualization:** Show congestion levels in a monthly calendar
- **Time × Day Visualization:** Congestion matrix by day of week and time period
- **Date × Time Visualization:** Detailed congestion by date and time within a month
- **AI Data Analysis:** Automatic analysis and suggestions using the Gemini API
- **Highlight Feature:** Automatic emphasis of notable data points

### 3.2. New Feature: State Sharing via URL Parameters

- **State Persistence via URL:** Save selected location, action, year, and month in URL parameters
- **Sharing Feature:** Button to copy the current view’s URL to the clipboard
- **Bookmark Support:** State is preserved when bookmarked
- **Initial Value Setting:** Automatically load initial values from URL parameters

### 3.3. User Interface Requirements

- **Responsive Design:** Layouts for mobile, tablet, and desktop
- **Intuitive Operation:** Easy operation through purpose-based selection menus
- **Visual Feedback:** Display during data loading and operation results
- **Accessibility:** Basic compliance with WCAG guidelines

## 4. Non-Functional Requirements

### 4.1. Performance Requirements

- **Initial Load Time:** Within 3 seconds (depending on network)
- **Data Update Response Time:** Within 2 seconds
- **Concurrent Users:** Supports around 100 simultaneous users

### 4.2. Security Requirements

- **Data Protection:** No processing of personal information
- **API Access Restrictions:** CORS settings as needed
- **Error Handling:** Error messages do not contain sensitive information

### 4.3. Availability Requirements

- **Uptime:** 24/7 operation
- **Backup:** Regular data backups
- **Disaster Recovery:** Procedures for recovery in case of failure

### 4.4. Maintainability Requirements

- **Code Quality:** Clean code structure and appropriate comments
- **Modularization:** Clear separation of functions and reusable components
- **Documentation:** Adequate documentation for code and features

## 5. Component Structure

### 5.1. Context and Router

- **CalendarContext:**
  - Manage selection state (location, action, year, month)
  - Synchronize with URL parameters
  - Handle API requests
  - Prevent race conditions (using AbortController)
- **Router Configuration:**
  - Read URL parameters and reflect state
  - Integrate with browser history

### 5.2. Common Components

- **Calendar.js:** Calendar-style congestion display
- **TimeHeatmap.js:** Congestion heatmap by day of week and time
- **DateTimeHeatmap.js:** Congestion heatmap by date and time
- **CongestionLegend.js:** Congestion legend display
- **HeatmapPopper.js:** Detail pop-up on cell selection
- **SelectionControls.js:** Selector group for view control

### 5.3. Layout Components

- **Header.js:** Navigation and main selection UI
- **Content.js:** Main content area
- **AISection.js:** AI analysis result area

### 5.4. UI/Utility Components

- **ShareButton.js:** Button to share the current view state
  - Clipboard functionality
  - Web Share API support for mobile
  - Various feedback displays
- **SectionContainer.js:** Wrapper for content sections
- **ScrollContainer.js:** Scrollable container

## 6. API Endpoints

### 6.1. Graph Data Retrieval

**Endpoint:** `/api/get-graph`  
**Method:** POST  
**Request:**
```json
{
  "place": "string",
  "action": "string",
  "year": "number",
  "month": "number"
}
```
**Response:**
```json
{
  "calendar_data": [...],
  "time_data": [...],
  "date_time_data": [...],
  "highlights": {...}
}
```

### 6.2. AI Advice Generation

**Endpoint:** `/api/analyze-csv`  
**Method:** POST  
**Request:**
```json
{
  "csvData": "string",
  "question": "string"
}
```
**Response:**
```json
{
  "analysis": "string",
  "recommendations": "string"
}
```

### 6.3. Data Retrieval Endpoints

- **CSV Data Retrieval:** `/api/fetch-csv` (GET)
- **Extended Data Retrieval:** `/api/fetch-csv-exmeidai` (GET)

## 7. Deployment Architecture

### 7.1. Frontend Deployment (Vercel)

- **Automated Deployment:** GitHub Actions workflow (`ci_front.yaml`)
- **Build Process:**
  - Set up Node.js 22.x
  - Install dependencies (`npm ci`)
  - Build (`npm run build`)
  - Auto-deploy to Vercel
- **Environment Variables:** Set in Vercel environment

### 7.2. Backend Deployment (AWS EC2)

- **Automated Deployment:** GitHub Actions workflow (`ci_back.yaml`)
- **Deployment Process:**
  - Transfer code to EC2 via SSH
  - Update Python virtual environment
  - Install dependencies
  - Restart Uvicorn server (port 8000)
  - Check and reload Nginx configuration
- **Runtime Environment:** Python 3.12 virtual environment
- **Error Logs:** `app.log` file

### 7.3. System Architecture Diagram

```
[User] --> [Vercel (Frontend)] --> [AWS EC2 (Backend API)] --> [CSV Data Store]
                                      |
                                      v
                                [Gemini API]
```

## 8. Future Development Plans

### 8.1. Short-Term Improvements

- **Eliminate Code Duplication:** Extract common logic among visualization components
- **Optimize State Management:** Enhance race condition handling in CalendarContext
- **Strengthen Error Handling:** Provide appropriate error messages to users
- **Extend URL Parameter Features:** Support more parameters (e.g., display mode)

### 8.2. Mid- to Long-Term Development

- **Database Introduction:** Migrate from CSV to database
- **User Authentication:** Login functionality for regional businesses
- **Custom Dashboards:** User-specific display customization
- **Expansion to Other Regions:** Support for other shopping districts and regions
- **Predictive Analysis:** Add future congestion prediction features
- **Interactive Analysis:** Enable user-driven data manipulation and analysis

### 8.3. Technical Debt Resolution

- **Introduce Testing:** Set up unit and integration tests
- **Refactor Components:** Improve for greater reusability
- **Performance Optimization:** Optimize for large datasets
- **Accessibility Improvements:** Support a broader range of users

## 9. Development Environment and Resources

- **Code Repository:** GitHub
- **Design Resources:** Figma ()
- **Deployment Environments:** Vercel (frontend), AWS EC2 (backend)
- **Legacy Version:** 
- **Frontend Preview:** 

## 10. Directory Structure

The project adopts a structure with clear separation by function and layer.

### 10.1. Backend Structure

```
backend/
├── app/
│   ├── api/
│   │   └── endpoints/         # API endpoint implementations
│   │       ├── csv_analysis.py
│   │       ├── fetch_csv.py
│   │       ├── get_graph.py
│   │       └── ...
│   ├── core/                  # Common settings/environment variables
│   │   └── config.py
│   ├── services/              # Business logic layer
│   │   ├── ai_service.py      # AI analysis features
│   │   ├── highlighter_service.py  # Data highlighting features
│   │   └── analyze/           # Data analysis modules
│   │       ├── analyze_weather.py
│   │       ├── analyze_event.py
│   │       ├── get_data_for_calendar.py
│   │       └── ...
│   └── main.py                # Application entry point
└── run.py                     # Server launch script
```

### 10.2. Frontend Structure

```
frontend/
├── public/                    # Static files
│   ├── assets/                # Logos and images
│   └── fonts/                 # Custom fonts
└── src/
    ├── assets/                # Static files used in source code
    ├── components/            # React components
    │   ├── common/            # General-purpose components
    │   │   ├── Calendar.js    # Calendar visualization component
    │   │   ├── TimeHeatmap.js # Time heatmap
    │   │   └── ...
    │   ├── layout/            # Layout structure
    │   │   ├── Header.js      # Header component
    │   │   ├── Content.js     # Main content area
    │   │   └── AISection.js   # AI analysis section
    │   └── ui/                # Basic UI elements
    │       ├── ShareButton.js # Share button
    │       └── ...
    ├── contexts/              # React context
    │   └── CalendarContext.js # Calendar-related state management
    ├── styles/                # Global styles
    ├── theme/                 # MUI theme settings
    │   └── theme.js
    └── utils/                 # Utility functions
```

This specification will be continuously updated as the project progresses.
