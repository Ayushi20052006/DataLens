# 📊 DataLens — Interactive Dataset Analysis Dashboard

DataLens is an elegant, real-time data exploration and profiling dashboard designed to process CSV or Excel spreadsheets, visualize their distributions, and execute raw SQL queries using an in-memory database—all with **zero configuration** required.

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

## 🚀 One-Command Dev Setup

To get both the FastAPI backend and the React frontend up and running concurrently with a single command, execute the provided startup script in the repository root:

```bash
chmod +x start.sh
./start.sh
```

This shell runner script automatically:
* Installs backend Python dependencies in your virtual environment (if present) or global environment.
* Boots the FastAPI gateway server via `uvicorn` on **`http://localhost:8000`**.
* Installs node packages and boots the React + Vite frontend compiler on **`http://localhost:5173`**.

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
