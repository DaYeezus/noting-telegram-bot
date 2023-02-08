import TelegramBot, { Message } from "node-telegram-bot-api";
import logger from "../utils/logger";
import { redisClient } from "../conf/redis.conf";
import { Note } from "../types";

export default async function (bot: TelegramBot, msg: Message) {
  try {
    const redisID = msg.from?.id.toString() || msg.chat.id.toString();
    const prevUserContent = await redisClient.get(redisID);
    if (!prevUserContent) {
      return await bot.sendMessage(
        msg.chat.id,
        "No notes found",
        {
          disable_notification: true,
          allow_sending_without_reply: false,
          protect_content: true,
        }
      );
    } else {
      const notes: Note[] = JSON.parse(prevUserContent);
      if(notes.length <=0) return bot.sendMessage(redisID, "You dont have no note yet")
      await bot.sendMessage(redisID, "There is your notes", {
        disable_notification: true,
        allow_sending_without_reply: false,
        protect_content: true,
        reply_markup: {
          force_reply: false,
          keyboard: notes.map((note) => [
            {
              text: `see ${
                typeof note.content === "string"
                  ? note.content.slice(0, 40)
                  : note.content.text ? note.content.text.slice(0, 40) : note.id 
              } ...`,
            },
          ]),
        },
      });
    }
  } catch (err) {
    bot.sendMessage(msg.chat.id, "Sorry something went wrong", {
      disable_notification: true,
      allow_sending_without_reply: true,
      protect_content: true,
    });
    logger.error(err);
  }
}
