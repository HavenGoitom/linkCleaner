import os
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, ContextTypes, filters
from cleaner import resolver


load_dotenv()
BOT_TOKEN = os.getenv("BOT_TOKEN")


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):

    await update.message.reply_text(
        " Hello! I am LinkCleaner Bot. Wanted to send a tiktok link but don't want to share your identifiers? No worries! I can help you with that."
        "Send me a link from Instagram, Snapchat, TikTok, or Pinterest. I will remove your identifiers and return a clean link."
    )


async def message(update: Update, context: ContextTypes.DEFAULT_TYPE):

    url = update.message.text

    result = resolver(url)

    if "error" in result:
        await update.message.reply_text(
            result["error"]
        )
        return

    await update.message.reply_text(
    f"🧹✨ Link cleaned!\n\n"
    f"Here’s your fresh link:\n"
    f"🔗 {result['resolved_url']}"
)


app = Application.builder().token(BOT_TOKEN).build()

app.add_handler(
    MessageHandler(filters.TEXT & ~filters.COMMAND, message)
)

app.add_handler(
    CommandHandler("start", start)
)

