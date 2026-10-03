from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from cleaner import resolver
from bot import app as bot_app


@asynccontextmanager
async def lifespan(app: FastAPI):

    await bot_app.initialize()
    await bot_app.start()
    await bot_app.updater.start_polling() # we did this because we wanted to starts telegram polling without blocking fastapi

    yield

    await bot_app.updater.stop()
    await bot_app.stop()
    await bot_app.shutdown()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():

    return {
        "message": "LinkCleaner API is live and running"
    }


@app.post("/api/resolve")
def resolve(url: str):

    return resolver(url)