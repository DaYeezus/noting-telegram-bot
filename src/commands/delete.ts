import TelegramBot, {Message} from "node-telegram-bot-api";
import logger from "../utils/logger";
import {redisClient} from "../conf/redis.conf";
import {Note} from "../types";

export default async function (bot: TelegramBot, msg: Message) {
    try {
        const noteId = (msg.text ? msg.text.split(' ') : msg.caption?.split(' '))?.find(i => i.length > 0 && !i.startsWith('/'));
        if (!noteId) {
            return bot.sendMessage(msg.chat.id, 'Please verify which note you want to delete');
        }

        const userNotes = await redisClient.get((msg.from?.id || msg.chat.id).toString());

        if (!userNotes) {
            return bot.sendMessage(msg.chat.id, 'No notes found');
        } else {
            const notes: Note[] = JSON.parse(userNotes);

            const note: Note | undefined = notes.find((note: Note) => noteId === note.id);

            if (!note) {
                return bot.sendMessage(msg.chat.id, 'Sorry there is no Note with this id');
            }

            await redisClient.getSet((msg.from?.id || msg.chat.id).toString(), JSON.stringify(notes.filter(note => note.id !== noteId)));

            return bot.sendMessage(msg.chat.id, 'Note deleted successfully');
        }
    } catch (err) {
        bot.sendMessage(msg.chat.id, 'Sorry something went wrong');
        logger.error(err);
    }
}
