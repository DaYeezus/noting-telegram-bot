import TelegramBot, { Message } from "node-telegram-bot-api";
import logger from "../utils/logger";
import { redisClient } from "../conf/redis.conf";
import { Note } from "../types";

export default async function (bot: TelegramBot, msg: Message) {
  try {
    // Get the user's ID from the message
    const redisID = msg.from?.id.toString() || msg.chat.id.toString();
    // Get the user's notes from Redis
    const prevUserContent = await redisClient.get(redisID);
    // If there are no notes, send a message to the user
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
      // Otherwise, parse the notes and send them to the user
    } else {
      const notes: Note[] = JSON.parse(prevUserContent);
      // Send the notes to the user with a keyboard of the notes
      await bot.sendMessage(redisID, "There is your notes", {
        disable_notification: true,
        allow_sending_without_reply: false,
        protect_content: true,
        reply_markup: {
          force_reply: false,
          // Map the notes to a keyboard of the notes
          keyboard: notes.map((note) => [
            {
              // Show the first 40 characters of the note
              text: `see ${
                typeof note.content === "string"
                  ? note.content.slice(0, 40)
                  : note.content.text.slice(0, 40)
              }`,
            },
          ]),
        },
      });
    }
  } catch (err) {
    // If an error occurs, send a message to the user
    bot.sendMessage(msg.chat.id, "Sorry something went wrong", {
      disable_notification: true,
      allow_sending_without_reply: true,
      protect_content: true,
    });
    // Log the error
    logger.error(err);
  }
}
