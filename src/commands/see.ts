/*
 This  code is used to retrieve a note from a user's notes stored in a Redis database. It takes in a
 TelegramBot and Message object as parameters. It then checks if the user has any notes stored in the database, and if so,
 it finds the note with the given ID. If the note is found, it checks the type of content stored in the note and sends the
 content back to the user in the form of a message, photo, or document. If an error occurs, it sends a message to the user
 saying something went wrong.
*/
import TelegramBot, {Message} from "node-telegram-bot-api";
import logger from "../utils/logger";
import {redisClient} from "../conf/redis.conf";
import {Content, Note} from "../types";

export default async function (bot: TelegramBot, msg: Message) {
    try {

        const noteId = msg.text ? msg.text.split(' ')[1] : msg.caption?.split(' ')[1];


        if (!noteId) return bot.sendMessage(msg.chat.id, 'Please verify which note you want to see');


        const userNotes = await redisClient.get((msg.from?.id || msg.chat.id).toString());


        if (!userNotes) {
            return bot.sendMessage(msg.chat.id, 'No notes found');


        } else {
            const notes: Note[] = JSON.parse(userNotes);

            let note: Note | undefined;
            const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}/g
            if(uuidRegex.test(noteId)){
                note=  notes.find((note: Note) =>note.id === noteId);
            }else{
                note = notes.find((note: Note) => typeof note.content === "string"  ? note.content.startsWith(noteId) : note.content.text.startsWith(noteId));
            }


            if (!note) {
                return bot.sendMessage(msg.chat.id, 'No note found with this id');


            } else {
                const content: Content = note.content


                if (typeof content !== "string" && content?.attachment) {
                    bot.sendMessage(msg.chat.id, `Note Id : ${note.id} \nNote content : ${content.text}`);
                    const {file_path} = await bot.getFile(content.attachment);
                    if (file_path?.startsWith('photos')) {
                        return bot.sendPhoto(msg.chat.id, content.attachment);
                    } else {
                        return bot.sendDocument(msg.chat.id, content.attachment);
                    }


                } else {
                    return bot.sendMessage(msg.chat.id, `Note Id : ${note.id} \nNote content : ${content}`);
                }
            }
        }
    } catch (err) {
        bot.sendMessage(msg.chat.id, 'Sorry something went wrong');
        logger.error(err);
    }
}
