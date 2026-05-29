# 📊 DataLens — Interactive Dataset Analysis Dashboard

DataLens is an elegant, real-time data exploration and profiling dashboard designed to process CSV or Excel spreadsheets, visualize their distributions, and execute raw SQL queries using an in-memory database—all with **zero configuration** required.

🌐 **Live Vercel Application:** [https://data-lens-sepia.vercel.app/](https://data-lens-sepia.vercel.app/)

---

## 🏛️ System Architecture

DataLens implements a modern, decoupled client-server architecture:

```mermaid
graph LR
    subgraph Client [Frontend - React & Vite]
        UI[App.jsx Dashboard] --> |Axios Single POST| API[FastAPI Gateway]
        UI --> |Axios Run SQL| API
    end
    subgraph Server [Backend - FastAPI & Pandas]
        API --> |Profiles Dataset| Analyzer[analyzer.py]
        API --> |Dynamic Materialization| SQLEngine[sql_engine.py]
        SQLEngine --> |In-Memory sqlite3| DB[(SQLite DB)]
    end
```

### Key Architectural Concepts
1. **Single-Upload Dynamic Profiling**: The frontend makes exactly one `POST /upload` request to the backend. The backend parses the dataset, runs statistical profiling, prepares the top-10 preview rows, and returns a single nested JSON response containing both analysis and schema previews.
2. **Ephemeral In-Memory Storage**: Tabular data is parsed using `pandas` and stored as an ephemeral dataframe in backend process memory (`df_store`), ensuring that uploaded files are never cached or written to disk.
3. **Dynamic SQLite Engine**: When custom SQL is entered, the backend dynamically instantiates a virtual SQLite connection and materializes the active pandas dataframe into an in-memory table named `dataset` to execute custom `pd.read_sql_query` evaluations safely.

---

## 🚀 How to Run the Site

You can run the full application either using the quick automated runner script or by starting the backend and frontend services manually.

### Option A: Quick Dev Setup (Automated Script)

To get both the FastAPI backend and the React frontend up and running concurrently with a single command, execute the provided startup script in the repository root:

```bash
chmod +x start.sh
./start.sh
```

This shell runner script automatically:
* Installs/updates backend Python dependencies in your virtual environment or global environment.
* Boots the FastAPI gateway server via `uvicorn` on **`http://localhost:8000`**.
* Installs node packages and boots the React + Vite frontend compiler on **`http://localhost:5173`**.

### Option B: Manual Setup (Step-by-Step)

If you prefer to run the services in separate terminal windows, follow these instructions:

#### 1. Start the FastAPI Backend
Open a terminal window and navigate to the `Backend` directory:
```bash
cd Backend

# (Optional) Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn main:app --reload --port 8000
```
The backend API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

#### 2. Start the React Frontend
Open a new terminal window and navigate to the `Frontend` directory:
```bash
cd Frontend

# Install node dependencies
npm install

# Start the Vite dev server
npm run dev
```
The client dashboard will be available at [http://localhost:5173/](http://localhost:5173/).

---

## ✨ Interactive Dashboard Features

DataLens is equipped with an elegant state-driven SPA workspace that categorizes dataset exploration into 5 specialized interactive panels:

1. **📊 Overview Workspace**:
   * **Real-time Stat Cards**: Tracks high-level indicators like total records loaded, fields detected, numeric/text column splits, missing value counters, and an overall **Data Quality completeness percentage**.
   * **Multi-Format Previews**: A dynamic visualization block permitting users to toggle instantly between **Bar**, **Line**, and **Area** representations of the dataset's numerical distributions.
2. **📈 Charts (Visualizations)**:
   * Displays a 2x2 grid containing specialized graphical visualizations powered by `recharts`:
     * **Bar Chart**: Enables direct, row-by-row comparisons of numeric values.
     * **Line Chart**: Traces trends and patterns across records.
     * **Pie Chart**: Visualizes categorical splits and proportions for text columns.
     * **Area Chart**: Shows smooth, gradient-filled distribution shapes.
3. **📋 Columns (Schema Diagnostics)**:
   * Evaluates dataset schema health at a database level.
   * Auto-identifies data types (`numeric`, `text`, `datetime`).
   * Displays distinct unique counts and null values per column.
   * Employs linear progress bars mapping missing value ratios alongside automated health badges (`Good` for < 5% nulls, `Fair` for 5-20%, `Poor` for > 20%).
4. **💾 SQL Console**:
   * An advanced, interactive workspace that materializes the active pandas dataset into a virtual table named `dataset`.
   * **Dynamic presets**: Select templates like `preview`, `row count`, `group by col1`, and `null check` that automatically auto-complete using the dataset's detected schema.
   * **Interactive tables**: Renders execution outputs in an elegant, custom-styled scrollable grid.
   * **Error Interceptor**: Catches and displays detailed syntax error logs directly within the UI context.
5. **🔍 Data Viewer**:
   * A clean database-style tabular viewer displaying the first 10 rows of the raw dataset, enabling swift, manual data audits.

---

## 🌐 Production Configuration & Deployment

DataLens is fully optimized and configured for seamless, automated multi-platform production deployments:

* **FastAPI Backend Service**:
  * Configured via `Backend/render.yaml` to build and deploy to **Render** web services.
  * Explicitly runs on a Python 3.11.0 runtime environment as specified in `runtime.txt`.
  * Implements explicit Cross-Origin Resource Sharing (CORS) in `main.py` to securely permit HTTP actions from the client domain.
* **React Frontend Application**:
  * Seamlessly structured for hosting on **Vercel** as a single-page application.
  * Implements dynamic API routing using Vite's production environment variables: `VITE_API_URL` (configured in `.env.production` pointing to the live backend server `https://datalens-vmzu.onrender.com`), falling back to local `http://localhost:8000` during development.

---

## 🐍 Backend API Documentation

The FastAPI gateway automatically generates high-fidelity OpenAPI specifications and interactive playgrounds. Once the backend services are running, you can explore, test, and execute API endpoints directly from the browser:

* **Swagger UI Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🛠️ Project Structure

```text
DataLens/
├── README.md              # Root repo architecture, startup runner, & doc links (This File)
├── start.sh               # Executable startup shell script
├── Backend/               # Python FastAPI backend service
│   ├── main.py            # API router mapping endpoints
│   ├── analyzer.py        # Pandas profiling engine
│   ├── sql_engine.py      # sqlite3 dynamic connector
│   └── requirements.txt   # Backend package manifests (FastAPI, Pandas, etc.)
└── Frontend/              # React single-page frontend application
    ├── README.md          # Frontend specific operational flow details
    ├── package.json       # Node package configurations
    └── src/
        └── App.jsx        # Integrated visual dashboard and logic
```
