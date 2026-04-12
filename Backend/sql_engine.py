import sqlite3
import pandas as pd

def run_query(df: pd.DataFrame, query: str):
    conn = sqlite3.connect(":memory:")
    try:
        df.to_sql("dataset", conn, index=False, if_exists="replace")
        result = pd.read_sql_query(query, conn)
        return {
            "columns": result.columns.tolist(),
            "rows": result.fillna("N/A").to_dict(orient="records")
        }
    except Exception as e:
        return {"error": str(e)}
    finally:
        conn.close()