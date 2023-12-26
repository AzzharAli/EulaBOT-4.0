const ffmpeg = require("fluent-ffmpeg");
const {MessageMedia} = require("whatsapp-web.js");
const ytdl = require("ytdl-core")
const fs = require("fs")

const database = require("../database")



const ytmp4 = async(url, chat, nomor) => {
    const setting = JSON.parse(fs.readFileSync("./config.json",{ encoding: 'utf8', flag: 'r' }));
    const namaBot = setting.namaBot;
    try {
        const videoUrl = url;
        const ingfo = await ytdl.getInfo(videoUrl)
        const videoTitle = ingfo['player_response']['videoDetails']['title'];
        const videoChannel = ingfo['player_response']['videoDetails']['author']
        const vidInfo = "Judul : "+videoTitle+"\nChannel : "+videoChannel;
        const videoFilename = (namaBot+" - "+ingfo['player_response']['videoDetails']['title']).replaceAll(/[^a-zA-Z ]/g, '_');
        const stream = ytdl(videoUrl,{ quality: '18' });
        stream.pipe(fs.createWriteStream("./temp/"+videoFilename+".mp4"));
        const cvh264 = async(input, output) => {
            return new Promise((resolve, reject) => {
                ffmpeg(input)
                  .videoCodec('libx264')
                  .on('end', () => {
                    const {size} = fs.statSync("./temp/"+videoFilename+"-h264.mp4");
                    if(size < 16000000){
                        let media = MessageMedia.fromFilePath("./temp/"+videoFilename+".mp4");
                        chat.sendMessage(media)
                        database.addLog(nomor, "Youtube Downloader MP4", "Success",groupName);
                    }else if(size < 64000000){
                        let media = MessageMedia.fromFilePath("./temp/"+videoFilename+".mp4");
                        chat.sendMessage(media, {sendMediaAsDocument:true})
                        database.addLog(nomor, "Youtube Downloader MP4", "Success",groupName);
                    }else{
                        chat.sendMessage("*"+namaBot+"*\n\nMohon Maaf, File Video terlalu besar untuk dikirim melalui WhatsApp");
                        database.addLog(nomor, "Youtube Downloader MP4", "Failed, File terlalu besar",groupName);
                    }
                    resolve();
                  })
                  .on('error', (err) => {
                    console.error('Error:', err);
                    database.addLog(nomor, "Youtube Downloader MP4", "Failed, Fitur Error",groupName);
                    reject(err);
                  })
                  .save(output);
              });
        }
        stream.on('finish', () => {
            cvh264("./temp/"+videoFilename+".mp4","./temp/"+videoFilename+"-h264.mp4");
        });
    } catch (error) {
        //console.log(error)
        chat.sendMessage("*"+namaBot+"*\n\nERROR :\n"+error)
        database.addLog(nomor, "Youtube Downloader MP4", "Failed, Fitur Error",groupName);
    }
}


const ytmp3 = async(url, chat, nomor) => {
    const setting = JSON.parse(fs.readFileSync("./config.json",{ encoding: 'utf8', flag: 'r' }));
    const namaBot = setting.namaBot;
    try {
        const videoUrl = url;
        const ingfo = await ytdl.getInfo(videoUrl)
        const videoTitle = ingfo['player_response']['videoDetails']['title'];
        const videoChannel = ingfo['player_response']['videoDetails']['author']
        const vidInfo = "Judul : "+videoTitle+"\nChannel : "+videoChannel;
        const videoFilename = ("EulaBOT - "+ingfo['player_response']['videoDetails']['title']).replaceAll(/[^a-zA-Z ]/g, '_');
        const stream = ytdl(videoUrl,{ filter: 'audioonly' });
        stream.pipe(fs.createWriteStream("./temp/"+videoFilename+".mp3"));
        const sendytmp3 = async()  => {
            const {size} = fs.statSync("./temp/"+videoFilename+".mp3");
            if(size < 64000000){
                let media = MessageMedia.fromFilePath("./temp/"+videoFilename+".mp3");
                chat.sendMessage(media, {sendMediaAsDocument:true});
                chat.sendMessage("*"+namaBot+"*\n\nInformasi Audio\n"+vidInfo+"\n\n*Pengiriman Audio sedang diproses");
                database.addLog(nomor, "Youtube Downloader MP3", "Success",groupName);
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nMohon Maaf, audio yang anda minta terlalu besar untuk dikirim!");
                database.addLog(nomor, "Youtube Downloader MP3", "Failed, File terlalu besar",groupName);
            }
        }
        stream.on('finish', () => {
            sendytmp3();
        });
      } catch (error) {
        message.reply("*"+namaBot+"*\n\nTerjadi Kesalahan, Video Mungkin Tidak Tersedia");
        database.addLog(nomor, "Youtube Downloader MP3", "Failed, Fitur Error",groupName);
      }
}


module.exports = {ytmp4,ytmp3}