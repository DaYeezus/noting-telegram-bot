import {config} from "dotenv"
import configureBot from "./conf/bot.conf";
config()
new configureBot(process.env.BOT_TOKEN || "")
