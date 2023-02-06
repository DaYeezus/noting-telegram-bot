import TelegramBot, {Message} from "node-telegram-bot-api";
import logger from "../utils/logger";
import {redisClient} from "../conf/redis.conf";
import {v4} from "uuid";
import {Content, Note} from "../types";

export default async function (bot:TelegramBot , msg:Message ){
    try{
        let content : Content | undefined = undefined;
        if(msg.text) {
            content = msg.text.split(' ').slice(1).join(' ')
        }else if(msg.caption){
            let attachment:string | null=null;
            if(msg.photo){
                attachment = msg.photo[0].file_id
            }else if(msg.document){
                attachment = msg.document.file_id
            }else {
                return bot.sendMessage(msg.chat.id , 'Invalid attachment')
            }
            content = {text:msg.caption.split(' ').slice(1).join(' ') , attachment}
        }else{
            bot.sendMessage(msg.chat.id , 'Invalid input')
        }
        if(content){
            const note_id = v4()
            const redisID = msg.from?.id.toString() || msg.chat.id.toString()
            const prevUserContent  = await redisClient.get(redisID)
            let finalContent : string | null;
            if(prevUserContent){
                 finalContent= JSON.stringify([...JSON.parse(prevUserContent) , {content , id:note_id} ])
            }else{
                finalContent = JSON.stringify([{content , id:note_id}])
            }
            await redisClient.getSet(redisID , finalContent)
            bot.sendMessage(redisID , `Note saved with id of ${note_id}`)
        }
    }catch (err){
        bot.sendMessage(msg.chat.id , 'Sorry something went wrong')
        logger.error(err)
    }
}
