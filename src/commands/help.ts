import TelegramBot, {Message} from "node-telegram-bot-api";

export default function (bot: TelegramBot, msg: Message) {
    return bot.sendMessage(msg.chat.id, `Hello Dear ${msg.chat.username} this is list of commands \n /help : show list of commands and their usage \n /save : save a note that can be text , document , image or combination of theme \n /see : can see a saved note base on its id \n /notes : return list of notes id that you can use to see your notes`)
}
