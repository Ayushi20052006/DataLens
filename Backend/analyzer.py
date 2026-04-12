import pandas as pd

def analyze(df):
    summary = {
        "shape": {"rows": df.shape[0], "cols": df.shape[1]},
        "columns": df.columns.tolist(),
        "dtypes": df.dtypes.astype(str).to_dict(),
        "nulls": df.isnull().sum().to_dict(),
        "null_percent": (df.isnull().mean() * 100).round(2).to_dict(),
        "unique_counts": df.nunique().to_dict(),
        "describe": df.describe(include="all").fillna("").astype(str).to_dict(),
        "head": df.head(10).fillna("N/A").to_dict(orient="records")
    }
    return summary