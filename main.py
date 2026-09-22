from fastapi import FastAPI

from cleaner import resolver


app = FastAPI()


@app.get("/")
def home():

    return {
        "message": "LinkCleaner API is live and running"
    }


@app.post("/api/resolve")
def resolve(url: str):

    return resolver(url)