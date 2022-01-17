from fastapi import FastAPI

API_VERSION = "0.0.1"
app = FastAPI()


@app.get(path="/api")
def api_info():
    return {"version": API_VERSION}
