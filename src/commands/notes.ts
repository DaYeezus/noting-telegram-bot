import TelegramBot, {Message} from "node-telegram-bot-api";
import logger from "../utils/logger";

export default function (bot:TelegramBot , msg:Message ){
    try{

    }catch (err){
        bot.sendMessage(msg.chat.id , 'Sorry something went wrong')
        logger.error(err)
    }
}
