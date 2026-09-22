import os
import httpx
from dotenv import load_dotenv

load_dotenv()

token = os.getenv("BOT_TOKEN")

response = httpx.get(
    f"https://api.telegram.org/bot{token}/getMe"
)

print(response.status_code)
print(response.text)