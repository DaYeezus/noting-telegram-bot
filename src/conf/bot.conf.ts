import TelegramBot, {Message} from "node-telegram-bot-api";
import {redisClient} from "./redis.conf";
import * as fs from "fs";
import * as path from "path";
import logger from "../utils/logger";

class configureBot {
    private readonly _bot: TelegramBot;

    constructor(private readonly token: string) {
        this._bot = new TelegramBot(this.token, {polling: true})
        redisClient.connect().then(() => {
            logger.info("Bot running" )
        })
        this.configureCommandHandlers()
        this.configureEventHandlers()
    }

    public async getBot() {
        return this._bot;
    }

    private   configureCommandHandlers() {
        const commandHandlers: { [command: string]: Function } = {};

        fs.readdirSync(path.join(__dirname , '..' , 'commands')).forEach(file => {
            const commandModule = require(path.join(__dirname , '..' , 'commands' , file));

            const commandName = file.split('.')[0];

            commandHandlers[commandName] = commandModule.default;
        });

        this._bot.onText(/^\/(\w+)(?: (\w+))?/, (msg: Message, match) => {
            if (match) {
                const command = match[1];

                if (commandHandlers[command]) {
                    try {
                        commandHandlers[command](this._bot, msg);
                    } catch (error) {
                        this._bot.sendMessage(msg.chat.id, 'Oops, something went wrong!');
                     logger.error(error)
                    }
                }else{
                    this._bot.sendMessage(msg.chat.id, 'Invalid command use /help to see list of available commands');
                }
            } else {
                this._bot.sendMessage(msg.chat.id, 'Invalid command use /help to see list of available commands');
            }
        });

        commandHandlers['start'] = (bot: TelegramBot, msg: Message) => {
            bot.sendMessage(msg.chat.id, `Welcome to my bot! How can I help you today?`);
        };

    }

    private configureEventHandlers() {
    }

}

export default configureBot
