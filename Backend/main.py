from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import io

from analyzer import analyze
from sql_engine import run_query

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store for the uploaded dataframe
df_store = {}

@app.get("/")
def root():
    return {"message": "DataLens API is running"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    if file.filename.endswith(".csv"):
        df = pd.read_csv(io.BytesIO(content))
    elif file.filename.endswith((".xlsx", ".xls")):
        df = pd.read_excel(io.BytesIO(content))
    else:
        return {"error": "Unsupported file type"}
    
    df_store["current"] = df
    df_store["filename"] = file.filename
    return {
        "analysis": analyze(df),
        "preview": {
            "columns": df.columns.tolist(),
            "rows": df.head(10).fillna("N/A").to_dict(orient="records")
        }
    }

class QueryBody(BaseModel):
    sql: str

@app.post("/query")
def run_sql(body: QueryBody):
    df = df_store.get("current")
    if df is None:
        return {"error": "No dataset loaded. Please upload a file first."}
    return run_query(df, body.sql)

@app.get("/preview")
def preview():
    df = df_store.get("current")
    if df is None:
        return {"error": "No dataset loaded"}
    return {
        "columns": df.columns.tolist(),
        "rows": df.head(10).fillna("N/A").to_dict(orient="records")
    }