import winston ,{createLogger , format ,transport} from "winston"
const { combine, timestamp, label, printf } = format;
const myFormat = printf(info => {
    return `${info.timestamp},${info.message}`;
});

const logger = createLogger({
    format: combine(
        timestamp(),
        myFormat
    ),
    transports: [
        new (winston.transports.File)({
            filename: './logs/bot-%DATE%.log',
            zippedArchive: true,
            maxFiles: 14
        }),
        new winston.transports.Console()
    ],

});
 export default logger
