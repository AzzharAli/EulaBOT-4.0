const fs = require("fs");
const { Client, LocalAuth, MessageMedia, ChatTypes } = require('whatsapp-web.js');
const axios = require("axios");
const { Module } = require("module");
const ytdl = require("ytdl-core");
const { TiktokDL, TiktokStalk } = require("@tobyg74/tiktok-api-dl");
const moment = require("moment-timezone");

//database
const database = require("./database");

const menu = require("./lib/menu")
const ssweb = require("./lib/ssweb")
const instagram = require("./lib/instagram");
const copypaste = require("./lib/copypaste")
// const ytdlconvert = require("./lib/ytdl-convert")
//const {docxToPdf} = require("./lib/fileconverter");
const { error } = require("console");
const islam = require("./lib/islam");
const waifu = require("./lib/waifu");
const akuariapi = require("./lib/akuariapi")

//Set Timezone
moment.locale('id');

//Function
function unixTimeFormatter(unixTime) {
    const formattedDate = moment.unix(unixTime).format('dddd, DD MMMM YYYY');
    return formattedDate;
}

const eulaLawrence = async(eula, message) => {
    const setting = JSON.parse(fs.readFileSync("./config.json",{ encoding: 'utf8', flag: 'r' }));
    const trigger = setting.trigger;
    const namaBot = setting.namaBot;
    const kontak = await message.getContact();
    const nomor = kontak.id.user;
    const pushname = kontak.pushname;
    const chat = await message.getChat();
    const isiPesan = message.body;
    const isiPesanLower = isiPesan.toLowerCase();
    const arrayIsiPesan = isiPesan.split(" ");
    const arrayIsiPesanLower = isiPesanLower.split(" ");
    const command = arrayIsiPesanLower.slice(0,1).toString();
    const eulawangi = arrayIsiPesanLower.slice(1).toString().replaceAll(","," ");
    const astawangi = arrayIsiPesan.slice(1).toString().replaceAll(","," ");

    //Get Userdata From DB
    const userData = await database.checkUserAvailable(nomor);

    //True if message send to group
    let isGroup;let groupName=false;if(message.from.includes('@g.us')){isGroup = true;groupName=chat.name;}else{isGroup = false;}

    //True if message sender is group admin
    let isGroupAdmin = false;
    if(isGroup == true){
        const participant = chat.participants;
        for(let a=0;a<participant.length;a++){
            if(participant[a]["id"]["user"] == nomor){
                isGroupAdmin = participant[a]["isAdmin"];
            }
        }
    }

    //Command Handle
    let res;
    switch(command){
        //TEST COMMAND
        case trigger+"test":
        case trigger+"tes":
        case trigger+" test":
        case trigger+" tes":
            await database.addLog(nomor, "Test Command", "Process",groupName);
            chat.sendMessage("*"+namaBot+"*\n\nSystem Online!");
            await database.addLog(nomor, "Test Command", "Success",groupName);
        break;
        //Register
        case trigger+"register":
        case trigger+" register":
            chat.sendMessage("*"+namaBot+"*\n\nRegistrasi Gagal, Nomor kamu telah terdaftar dengan nama : *"+userData.name+"*")
        break;
        //Menu
        case trigger+"menu":
        case trigger+" menu":
            await database.addLog(nomor, "Menu", "Process",groupName);
            res = await menu(nomor);
            chat.sendMessage(res)
            await database.addLog(nomor, "Menu", "Success",groupName);
        break;
        //Stiker
        case trigger+"stiker":
        case trigger+" stiker":
        case trigger+"sticker":
        case trigger+" sticker":
            if(userData.point >= 20 || userData.admin == true || userData.owner == true || setting.bypassPoin == true){
                if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                    await database.cutPoint(nomor,20)
                } 
                await database.addLog(nomor, "Stiker", "Process",groupName);
                let stcname;if(eulawangi != ""){stcname=astawangi}else{stcname="Sticker by "+userData.name}
                if(message.hasQuotedMsg){
                    let quotedMsg = await message.getQuotedMessage();
                    if(quotedMsg.hasMedia){
                        let media = await quotedMsg.downloadMedia();
                        chat.sendMessage(media, {sendMediaAsSticker: true, stcname, stickerAuthor : namaBot});
                        await database.addLog(nomor, "Stiker", "Success",groupName);
                    }else{
                        if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                            await database.addPoint(nomor,20)
                        } 
                        await database.addLog(nomor, "Stiker", "Failed image not found0",groupName);
                        message.reply("*"+namaBot+"*\nFormat Pesan Salah, Kirim Gambar atau Reply Gambar dengan Caption : " + trigger + "stiker <nama stiker> (nama stiker optional)");
                    }
                }else{
                    if(message.hasMedia){
                        let media = await message.downloadMedia();
                        chat.sendMessage(media, {sendMediaAsSticker: true, stcname, stickerAuthor : namaBot});
                        await database.addLog(nomor, "Stiker", "Success",groupName);
                    }else{
                        if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                            await database.addPoint(nomor,20)
                        } 
                        await database.addLog(nomor, "Stiker", "Failed image not found",groupName);
                        message.reply("*"+namaBot+"*\nFormat Pesan Salah, fitur ini berfungsi mengubah gambar menjadi stiker dengan cara Kirim Gambar atau Reply Gambar dengan Caption : " + trigger + "stiker <nama stiker> (nama stiker optional)");
                    }
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nPoin anda tidak cukup untuk menggunakan fitur ini, jumlah poin anda saat ini : "+userData.point)
            }
        break;
        //STIMG
        case trigger+"stimg":
        case trigger+" stimg":
            if(userData.point >= 20 || userData.admin == true || userData.owner == true || setting.bypassPoin == true){
                if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                    await database.cutPoint(nomor,20)
                }
                await database.addLog(nomor, "Stiker to image", "Process",groupName);
                if(message.hasQuotedMsg){
                    let quotedMsg = await message.getQuotedMessage();
                    if(quotedMsg.hasMedia){
                        let media = await quotedMsg.downloadMedia();
                        let kirim = new MessageMedia('image/png', media.data);
                        chat.sendMessage(kirim);
                        await database.addLog(nomor, "Stiker to image", "Success",groupName);
                    }else{
                        message.reply("*"+namaBot+"*\nFormat Pesan Salah, Reply Stiker dengan text : "+trigger+"stimg");
                        if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                            await database.addPoint(nomor,20)
                        }
                    }
                }else{
                    message.reply("*"+namaBot+"*\nFormat Pesan Salah, fitur ini untuk merubah stiker menjadi gambar dengan cara Reply Stiker dengan text : "+trigger+"stimg");
                    if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                        await database.addPoint(nomor,20)
                    }
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nPoin anda tidak cukup untuk menggunakan fitur ini, jumlah poin anda saat ini : "+userData.point)
            }
        break;
        //spy
        case trigger+"look":
        case trigger+" look":
        case trigger+"spy":
        if(userData.point >= 100 || userData.admin == true || userData.owner == true || setting.bypassPoin == true){
            if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                await database.cutPoint(nomor,100)
            }
            await database.addLog(nomor, "spy media", "Process",groupName);
            if(message.hasQuotedMsg){
                let quotedMsg = await message.getQuotedMessage();
                if(quotedMsg.hasMedia){
                    if(quotedMsg.type == "image"){
                        try {
                            res = await quotedMsg.downloadMedia();
                            await database.addLog(nomor, "spy media", "Success send Image",groupName)
                            chat.sendMessage(res);
                        } catch (error) {
                            await database.addLog(nomor, "spy media", "Failed Get Image",groupName)
                            message.reply("*"+namaBot+"*\n\nGagal Mengambil Data Gambar!");
                            if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                                await database.addPoint(nomor,100)
                            }
                        }
                    }else if(quotedMsg.type == "video"){
                        const filename = "./temp/lookvid.mp4";
                        if (fs.existsSync(filename)) {
                            await fs.unlink(filename);
                        }
                        function writeFileAsync(filename, data) {
                            return new Promise((resolve, reject) => {
                              fs.writeFile(filename, data, (error) => {
                                if (error) {
                                  reject(error);
                                } else {
                                  resolve();
                                }
                              });
                            });
                          }
                          function unlinkFileAsync(filename) {
                            return new Promise((resolve, reject) => {
                              fs.unlink(filename, (error) => {
                                if (error) {
                                  reject(error);
                                } else {
                                  resolve();
                                }
                              });
                            });
                          }
                        try {
                            res = await quotedMsg.downloadMedia();
                            const buffer = Buffer.from((res.data), "base64");
                            await writeFileAsync(filename, buffer);
                            const hasile = await MessageMedia.fromFilePath(filename);
                            await unlinkFileAsync(filename)
                            //console.log(hasile.filesize);
                            if(hasile.filesize != undefined && hasile.filesize != null){
                                chat.sendMessage(hasile)
                                await database.addLog(nomor, "spy media", "Success seng Video",groupName)
                            }else{
                                message.reply("*"+namaBot+"*\n\nGagal Mengambil Data Video!");
                                await database.addLog(nomor, "spy media", "Failed send Video",groupName)
                            }
                        } catch (error) {
                            //message.reply("*"+namaBot+"*\n\nGagal Mendownload Video!");
                            message.reply("*"+namaBot+"*\n\nGagal Mengambil Data Video!");
                            await database.addLog(nomor, "spy media", "Failed get Video data",groupName);
                            await database.addLog(nomor, "spy media", error,groupName)
                            if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                                await database.addPoint(nomor,100)
                            }
                        }
                    }else{
                        message.reply("*"+namaBot+"*\n\nPermintaan Tidak Valid!");
                        await database.addLog(nomor, "spy media", "Failed get message type",groupName)
                        if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                            await database.addPoint(nomor,100)
                        }
                    }
                }else{
                    message.reply("*"+namaBot+"*\n\nFormat Pesan Salah!, reply gambar sekali lihat dengan : " + trigger + "look");
                    await database.addLog(nomor, "spy media", "Failed message format wrong",groupName)
                    if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                        await database.addPoint(nomor,100)
                    }
                }
            }else{
                message.reply("*"+namaBot+"*\n\nFormat Pesan Salah!, fitur ini digunakan untuk menampilkan pesan sekali lihat dengan cara reply gambar sekali lihat dengan : " + trigger + "look");
                await database.addLog(nomor, "spy media", "Failed message format wrong",groupName)
                if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                    await database.addPoint(nomor,100)
                }   
            }
        }else{
            chat.sendMessage("*"+namaBot+"*\n\nPoin anda tidak cukup untuk menggunakan fitur ini, jumlah poin anda saat ini : "+userData.point)
        }
        break;
        //SSWEB
        case trigger+"ssweb":
        case trigger+" ssweb":
            if(userData.point >= 50 || userData.admin == true || userData.owner == true || setting.bypassPoin == true){
                if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                    await database.cutPoint(nomor,50)
                }
                await database.addLog(nomor, "WEB Screenshoot", "Process",groupName);
                if(eulawangi != ""){
                    res = await ssweb(astawangi);
                    if(res != false){
                        const media = await MessageMedia.fromFilePath("./temp/webscreenshot.png");
                        chat.sendMessage(media)
                        await database.addLog(nomor, "WEB Screenshoot", "Success",groupName);
                    }else{
                        message.reply("*"+namaBot+"*\n\nGagal mengambil screenshoot");
                        await database.addLog(nomor, "WEB Screenshoot", "Failed",groupName);
                        if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                            await database.addPoint(nomor,50)
                        }   
                    }
                }else{
                    message.reply("*"+namaBot+"*\n\nFormat Pesan Salah, fitur ini untuk melakukan screenshoot pada WEB dengan format "+trigger+"ssweb nekopoi.care");
                    await database.addLog(nomor, "WEB Screenshoot", "Failed url invalid",groupName);
                    if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                        await database.addPoint(nomor,50)
                    }   
                }    
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nPoin anda tidak cukup untuk menggunakan fitur ini, jumlah poin anda saat ini : "+userData.point)
            }
        break;
        //IGpost
        case trigger+"igpost":
        case trigger+" igpost":
            if(userData.point >= 50 || userData.admin == true || userData.owner == true || setting.bypassPoin == true){
                if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                    await database.cutPoint(nomor,50)
                }
                if(eulawangi != false){
                    await database.addLog(nomor, "IG Post Downloader", "Process",groupName);
                    if(eulawangi.includes("/p/")){
                        res = (await instagram(astawangi)).data;
                        if(res.length > 0){
                            let konten;
                            for(let a=0;a<res.length;a++){;
                                if(res[a]["type"] == "video"){
                                    konten = await MessageMedia.fromUrl(res[a]["url"], {unsafeMime:true, mimetype:"mp4"});
                                }else{
                                    konten = await MessageMedia.fromUrl(res[a]["url"]);
                                }
                                chat.sendMessage(konten)
                                await database.addLog(nomor, "IG Post Downloader", "Success",groupName);
                            }
                        }else{
                            message.reply("*"+namaBot+"*\n\nKonten Tidak Ditemukan");
                            await database.addLog(nomor, "IG Post Downloader", "Failed, konten tidak ditemukan",groupName);
                            if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                                await database.addPoint(nomor,50)
                            }  
                        }
                    }else{
                        message.reply("*"+namaBot+"*\n\nIni bukan link post instagram!");
                        await database.addLog(nomor, "IG Post Downloader", "Failed, url invalid",groupName);
                        if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                            await database.addPoint(nomor,50)
                        }  
                    }
                }else{
                    message.reply("*"+namaBot+"*\n\nFitur ini berfungsi mendownload postingan instagram dengan cara ketik "+trigger+"igpost https://www.instagram.com/p/C0amm9wRzrY/?igshid=MzRlODBiNWFlZA==");
                    await database.addLog(nomor, "IG Post Downloader", "Failed, url not found",groupName);
                    if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                        await database.addPoint(nomor,50)
                    }  
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nPoin anda tidak cukup untuk menggunakan fitur ini, jumlah poin anda saat ini : "+userData.point)
            }
        break;
        //IGreel
        case trigger+"igreel":
        case trigger+" igreel":
            if(userData.point >= 50 || userData.admin == true || userData.owner == true || setting.bypassPoin == true){
                if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                    await database.cutPoint(nomor,50)
                }
                if(eulawangi != false){
                    await database.addLog(nomor, "IG Reel Downloader", "Process",groupName);
                    try {
                        if(eulawangi.includes("/reel/")){
                            res = (await instagram(astawangi)).data;
                            if(res.length > 0){
                                let konten;
                                konten = await MessageMedia.fromUrl(res[0]["url"], {unsafeMime:true, mimetype:"mp4"});
                                if(konten.filesize < 15000000){
                                    chat.sendMessage(konten)
                                }else if(konten.filesize < 63000000){
                                    chat.sendMessage(konten, {sendMediaAsDocument:true})
                                }else{
                                    message.reply("*"+namaBot+"\n\nMohon Maaf, Video terlalu besar untuk dikirim!");
                                    await database.addLog(nomor, "IG Reel Downloader", "Failed, file terlalu besar untuk dikirim",groupName);
                                    if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                                        await database.addPoint(nomor,50)
                                    }
                                }
                            }else{
                                message.reply("*"+namaBot+"*\n\nKonten Tidak Ditemukan");
                                await database.addLog(nomor, "IG Reel Downloader", "Failed, konten tidak ditemukan",groupName);
                                if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                                    await database.addPoint(nomor,50)
                                }
                            }
                        }else{
                            message.reply("*"+namaBot+"*\n\nIni bukan link reel!");
                            await database.addLog(nomor, "IG Reel Downloader", "Failed, url invalid",groupName);
                            if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                                await database.addPoint(nomor,50)
                            }
                        }
                } catch (error) {
                    message.reply("*"+namaBot+"*\n\nFitur sedang bermasalah");
                    console.log(error)
                    await database.addLog(nomor, "IG Reel Downloader", "failed, fitur error",groupName);
                    if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                        await database.addPoint(nomor,50)
                    }
                }
                }else{
                    message.reply("*"+namaBot+"*\n\nFitur ini berfungsi mendownload reel instagram dengan cara ketik "+trigger+"igpost https://www.instagram.com/reel/CzGdJWtIv7O/?igshid=MzRlODBiNWFlZA==");
                    await database.addLog(nomor, "IG Post Downloader", "Failed, url not found",groupName);
                    if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                        await database.addPoint(nomor,50)
                    }
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nPoin anda tidak cukup untuk menggunakan fitur ini, jumlah poin anda saat ini : "+userData.point)
            }
        break;
        //YTMP4
        case trigger+"ytmp4":
            await database.addLog(nomor, "Youtube Downloader MP4", "Process",groupName);
            if(userData.point >= 50 || userData.admin == true || userData.owner == true || setting.bypassPoin == true){
                if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                    await database.cutPoint(nomor,50)
                }
                if(astawangi != ""){
                    if(astawangi.includes("youtube") || astawangi.includes("youtu.be")){
                        try {
                            const videoUrl = astawangi;
                            const ingfo = await ytdl.getInfo(videoUrl)
                            const videoTitle = ingfo['player_response']['videoDetails']['title'];
                            const videoChannel = ingfo['player_response']['videoDetails']['author']
                            const vidInfo = "Judul : "+videoTitle+"\nChannel : "+videoChannel;
                            const videoFilename = ("EulaBOT - "+ingfo['player_response']['videoDetails']['title']).replaceAll(/[^a-zA-Z ]/g, '_');
                            fs.readdir("./temp/yt", (err, files) => {
                                if (err) {
                                console.error(err);
                                return;
                                }
                                for (const file of files) {
                                fs.unlink(`./temp/yt/${file}`, err => {
                                    if (err) {
                                    console.error(err);
                                    return;
                                    }});}});
                            const stream = ytdl(videoUrl,{ quality: '18' });
                            stream.pipe(fs.createWriteStream("./temp/yt/"+videoFilename+".mp4"));
                            const sendytmp4 = async() => {
                                const {size} = fs.statSync("./temp/yt/"+videoFilename+".mp4");
                                if(size < 64000000){
                                    let media = MessageMedia.fromFilePath("./temp/yt/"+videoFilename+".mp4");
                                    chat.sendMessage(media, {sendMediaAsDocument:true});
                                    chat.sendMessage("*"+namaBot+"*\n\nInformasi Video\n"+vidInfo+"\n\n*Pengiriman Video sedang diproses");
                                    await database.addLog(nomor, "Youtube Downloader MP4", "Success",groupName);
                                }else{
                                    chat.sendMessage("*"+namaBot+"*\n\nMohon Maaf, video yang anda minta terlalu besar untuk dikirim!");
                                    await database.addLog(nomor, "Youtube Downloader MP4", "Failed oversize file",groupName);
                                    if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                                        await database.addPoint(nomor,50)
                                    }
                                }
                            }
                            stream.on('finish', () => {
                                sendytmp4();
                            });
                          } catch (error) {
                            message.reply("*"+namaBot+"*\n\nTerjadi Kesalahan, Video Mungkin Tidak Tersedia");
                            console.log(error);
                            await database.addLog(nomor, "Youtube Downloader MP4", "Failed media invalid",groupName);
                            if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                                await database.addPoint(nomor,50)
                            }
                          }
                    }else{
                        message.reply("*"+namaBot+"*\n\nKirim Link Youtube Woi")
                        await database.addLog(nomor, "Youtube Downloader MP4", "Failed link invalid",groupName);
                        if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                            await database.addPoint(nomor,50)
                        }
                    }
                    
                }else{
                    message.reply("*"+namaBot+"*\n\nMana Linknya Woi")
                    await database.addLog(nomor, "Youtube Downloader MP4", "Failed link empty",groupName);
                    if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                        await database.addPoint(nomor,50)
                    }
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nPoin anda tidak cukup untuk menggunakan fitur ini, jumlah poin anda saat ini : "+userData.point)
            }
        break;
        //YTMP3
        case trigger+"ytmp3":
            if(userData.point >= 50 || userData.admin == true || userData.owner == true || setting.bypassPoin == true){
                if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                    await database.cutPoint(nomor,50)
                }
                await database.addLog(nomor, "Youtube Downloader MP3", "Process",groupName);
                if(astawangi != ""){
                    if(astawangi.includes("youtube") || astawangi.includes("youtu.be")){
                        try {
                            const videoUrl = astawangi;
                            const ingfo = await ytdl.getInfo(videoUrl)
                            const videoTitle = ingfo['player_response']['videoDetails']['title'];
                            const videoChannel = ingfo['player_response']['videoDetails']['author']
                            const vidInfo = "Judul : "+videoTitle+"\nChannel : "+videoChannel;
                            const videoFilename = ("EulaBOT - "+ingfo['player_response']['videoDetails']['title']).replaceAll(/[^a-zA-Z ]/g, '_');
                            fs.readdir("./temp/yt", (err, files) => {
                                if (err) {
                                console.error(err);
                                return;
                                }
                                for (const file of files) {
                                fs.unlink(`./temp/yt/${file}`, err => {
                                    if (err) {
                                    console.error(err);
                                    return;
                                    }});}});
                            const stream = ytdl(videoUrl,{ filter: 'audioonly' });
                            stream.pipe(fs.createWriteStream("./temp/yt/"+videoFilename+".mp3"));
                            const sendytmp3 = async()  => {
                                const {size} = fs.statSync("./temp/yt/"+videoFilename+".mp3");
                                if(size < 64000000){
                                    let media = MessageMedia.fromFilePath("./temp/yt/"+videoFilename+".mp3");
                                    chat.sendMessage(media, {sendMediaAsDocument:true});
                                    chat.sendMessage("*"+namaBot+"*\n\nInformasi Audio\n"+vidInfo+"\n\n*Pengiriman Audio sedang diproses");
                                    await database.addLog(nomor, "Youtube Downloader MP3", "Success",groupName);
                                }else{
                                    chat.sendMessage("*"+namaBot+"*\n\nMohon Maaf, audio yang anda minta terlalu besar untuk dikirim!");
                                    await database.addLog(nomor, "Youtube Downloader MP3", "Failed oversize file",groupName);
                                    if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                                        await database.addPoint(nomor,50)
                                    }
                                }
                            }
                            stream.on('finish', () => {
                                sendytmp3();
                            });
                          } catch (error) {
                            message.reply("*"+namaBot+"*\n\nTerjadi Kesalahan, Video Mungkin Tidak Tersedia");
                            if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                                await database.addPoint(nomor,50)
                            }
                          }
                    }else{
                        message.reply("*"+namaBot+"*\n\nKirim Link Youtube Woi");
                        await database.addLog(nomor, "Youtube Downloader MP3", "Failed link invalid",groupName);
                        if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                            await database.addPoint(nomor,50)
                        }
                    }      
                }else{
                    message.reply("*"+namaBot+"*\n\nMana Linknya Woi");
                    await database.addLog(nomor, "Youtube Downloader MP3", "Failed link empty",groupName);
                    if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                        await database.addPoint(nomor,50)
                    }
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nPoin anda tidak cukup untuk menggunakan fitur ini, jumlah poin anda saat ini : "+userData.point)
            }
        break;
        //YTDIRECT YTTA
        case trigger+"ytdirect":
            if(eulawangi != ""){
                const datavideo = await ytdl.getInfo(astawangi)
                const formats = ytdl.filterFormats(datavideo.formats, 'videoandaudio');
                const judul = datavideo.player_response.videoDetails.title;
                const channel = datavideo.player_response.videoDetails.author;
                const directlink = formats[0]['url']
                const text = "*"+namaBot+"*\n\nJUDUL : "+judul+"\nCHANNEL : "+channel+"\nURL : \n"+directlink;
                chat.sendMessage(text)
            }else{

            }
        break;
        //ttmp4
        case trigger+"ttmp4":
            if(userData.point >= 50 || userData.admin == true || userData.owner == true || setting.bypassPoin == true){
                if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                    await database.cutPoint(nomor,50)
                }
                await database.addLog(nomor, "TikTok Downloader MP4", "Process",groupName);
                if(eulawangi != ""){
                    if(eulawangi.includes("tiktok")){
                        try {
                            res = await TiktokDL(astawangi,{version:"v3"});
                            if(res.status == "success"){
                                const caption = "*"+namaBot+"*\n\n*Deskripsi* : "+res.result.desc+"\n*Author* : "+res.result.author.nickname;
                                const vidlink = res.result.video2;
                                konten = await MessageMedia.fromUrl(vidlink, {unsafeMime:true, mimetype:"mp4"});
                                if(konten.filesize < 15000000){
                                    chat.sendMessage(konten,{caption:caption});
                                    await database.addLog(nomor, "TikTok Downloader MP4", "Success",groupName);
                                }else if(konten.filesize < 63000000){
                                    chat.sendMessage(konten,{caption:caption, sendMediaAsDocument:true});
                                    await database.addLog(nomor, "TikTok Downloader MP4", "Success",groupName);
                                }else{
                                    message.reply("*"+namaBot+"*\n\nMohon Maaf, Ukuran Video terlalu besar untuk dikirim!");
                                    await database.addLog(nomor, "TikTok Downloader MP4", "Failed, File terlalu besar",groupName);
                                    if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                                        await database.addPoint(nomor,50)
                                    }
                                }
                            }else{
                                message.reply("*"+namaBot+"*\n\nKonten tidak ditemukan!");
                                await database.addLog(nomor, "TikTok Downloader MP4", "Konten tidak ditemukan",groupName);
                                if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                                    await database.addPoint(nomor,50)
                                }
                            }
                        } catch (error) {
                            message.reply("*"+namaBot+"*\n\nLink Tidak Valid!");
                            await database.addLog(nomor, "TikTok Downloader MP4", "Failed, Fitur Error",groupName);
                            if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                                await database.addPoint(nomor,50)
                            }
                        }
                    }else{
                        message.reply("*"+namaBot+"*\n\nIni bukan link TikTok!")
                        await database.addLog(nomor, "TikTok Downloader MP4", "Failed, url invalid",groupName);
                        if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                            await database.addPoint(nomor,50)
                        }
                    }
                }else{
                    message.reply("*"+namaBot+"*\n\nFormat Pesan Salah, "+trigger+"ttmp4 https://tiktok.com/xxnxxxxnx")
                    await database.addLog(nomor, "TikTok Downloader MP4", "Failed, url not found",groupName);
                    if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                        await database.addPoint(nomor,50)
                    }
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nPoin anda tidak cukup untuk menggunakan fitur ini, jumlah poin anda saat ini : "+userData.point)
            }
        break;
        //ttmp3
        case trigger+"ttmp3":
            if(userData.point >= 50 || userData.admin == true || userData.owner == true || setting.bypassPoin == true){
                if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                    await database.cutPoint(nomor,50)
                }
                await database.addLog(nomor, "TikTok Downloader MP3", "Process",groupName);
                if(eulawangi != ""){
                    if(eulawangi.includes("tiktok")){
                        try {
                            res = await TiktokDL(astawangi,{version:"v3"});
                            if(res.status == "success"){
                                const caption = "*"+namaBot+"*\n\n*Deskripsi* : "+res.result.desc+"\n*Author* : "+res.result.author.nickname;
                                const audlink = res.result.music;
                                konten = await MessageMedia.fromUrl(audlink);
                                if(konten.filesize < 15000000){
                                    chat.sendMessage(konten,{sendAudioAsVoice:true});
                                    chat.sendMessage(caption)
                                    await database.addLog(nomor, "TikTok Downloader MP3", "Success",groupName);
                                }else if(konten.filesize < 63000000){
                                    chat.sendMessage(konten,{sendMediaAsDocument:true,caption:caption});
                                    await database.addLog(nomor, "TikTok Downloader MP3", "Success",groupName);
                                }else{
                                    message.reply("*"+namaBot+"*\n\nMohon Maaf, Ukuran Audio terlalu besar untuk dikirim!");
                                    await database.addLog(nomor, "TikTok Downloader MP3", "Failed, File terlalu besar",groupName);
                                    if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                                        await database.addPoint(nomor,50)
                                    }
                                }
                            }else{
                                message.reply("*"+namaBot+"*\n\nKonten tidak ditemukan!");
                                await database.addLog(nomor, "TikTok Downloader MP3", "Failed, konten tidak ditemukan",groupName);
                                if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                                    await database.addPoint(nomor,50)
                                }
                            }
                        } catch (error) {
                            message.reply("*"+namaBot+"*\n\nLink Tidak Valid!");
                            await database.addLog(nomor, "TikTok Downloader MP3", "Failed, Fitur Error",groupName);
                            if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                                await database.addPoint(nomor,50)
                            }
                        }
                    }else{
                        message.reply("*"+namaBot+"*\n\nIni bukan link TikTok!")
                        await database.addLog(nomor, "TikTok Downloader MP3", "Failed, url invalid",groupName);
                        if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                            await database.addPoint(nomor,50)
                        }
                    }
                }else{
                    message.reply("*"+namaBot+"*\n\nFormat Pesan Salah, "+trigger+"ttmp4 https://tiktok.com/xxnxxxxnx")
                    await database.addLog(nomor, "TikTok Downloader MP3", "Failed, url not found",groupName);
                    if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                        await database.addPoint(nomor,50)
                    }
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nPoin anda tidak cukup untuk menggunakan fitur ini, jumlah poin anda saat ini : "+userData.point)
            }
        break;
        //TTStalk
        case trigger+"ttstalk":
        case trigger+" ttstalk":
            if(userData.point >= 50 || userData.admin == true || userData.owner == true || setting.bypassPoin == true){
                if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                    await database.cutPoint(nomor,50)
                }
                if(eulawangi != ""){
                    const ttusername = astawangi.replaceAll("@","");
                    res = await TiktokStalk(ttusername);
                    if(res.status == "success"){
                        const avatar = res.result.users.avatar;
                        let verified = "NO";if(res.result.users.verified == true){verified = "YES"}
                        const caption = "*"+namaBot+"*\n\n*Username* : "+res.result.users.username+"\n*Nickname* : "+res.result.users.nickname+"\n*Region* : "+res.result.users.region+"\n*Follower* : "+res.result.stats.followerCount+"\n*Following* : "+res.result.stats.followingCount+"\n*Video* : "+res.result.stats.videoCount+"\n*Verified* : "+verified+"\n*Signature* :\n"+res.result.users.signature;
                        konten = await MessageMedia.fromUrl(avatar);
                        chat.sendMessage(konten,{caption:caption});
                    }else{
                        message.reply("*"+namaBot+"*\n\nUsername Tidak Ditemukan");
                        if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                            await database.addPoint(nomor,50)
                        }
                    }
                }else{
                    message.reply("*"+namaBot+"*\n\nFormat Pesan Salah, "+trigger+"ttstalk <username tiktok>")
                    if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                        await database.addPoint(nomor,50)
                    }
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nPoin anda tidak cukup untuk menggunakan fitur ini, jumlah poin anda saat ini : "+userData.point)
            }
        break;
        //jadwal sholat
        case trigger+"jadwalsholat":
            if(userData.point >= 20 || userData.admin == true || userData.owner == true || setting.bypassPoin == true){
                if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                    await database.cutPoint(nomor,20)
                }
                await database.addLog(nomor, "Jadwal Sholat", "Process",groupName);
                if(eulawangi != ""){
                    const dataDaerah = await islam.searchDaerah(eulawangi);
                    if(dataDaerah != false){
                        const pesan = "*"+namaBot+"*\n\nJadwal Sholat hari ini untuk wilayah "+astawangi+"\n\nShubuh : "+dataDaerah.Shubuh+"\nDhuhur : "+dataDaerah.Dzuhur+"\nAshar : "+dataDaerah.Ashr+"\nMaghrib : "+dataDaerah.Maghrib+"\nIsya : "+dataDaerah.Isya;
                        chat.sendMessage(pesan);
                        await database.addLog(nomor, "Jadwal Sholat", "Success ",groupName);
                    }else{
                        message.reply("*"+namaBot+"*\n\n Daerah "+eulawangi+" Tidak Ditemukan, input hanya untuk Kota/Kabupatem");
                        await database.addLog(nomor, "Jadwal Sholat", "Failed kota tidak ditemukan",groupName);
                        if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                            await database.addPoint(nomor,20)
                        }
                    }
                }else{
                    message.reply("*"+namaBot+"*\n\nFormat Pesan Salah, Contoh : *"+trigger+"jadwalsholat gresik*");
                    await database.addLog(nomor, "Jadwal Sholat", "Failed empty query",groupName);
                    if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                        await database.addPoint(nomor,20)
                    }
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nPoin anda tidak cukup untuk menggunakan fitur ini, jumlah poin anda saat ini : "+userData.point)
            }
        break;
        //wangi1
        case trigger+"wangi1":
            if(userData.point >= 20 || userData.admin == true || userData.owner == true || setting.bypassPoin == true){
                if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                    await database.cutPoint(nomor,20)
                }
                await database.addLog(nomor, "Wangi 1", "Process",groupName);
                if(eulawangi != ""){
                    const waifu = eulawangi.toUpperCase();
                    await database.addLog(nomor, "Wangi 1", "Success, Waifu :"+eulawangi,groupName);
                    chat.sendMessage(await copypaste.wangi1(waifu));
                }else{
                    message.reply("*"+namaBot+"*\n\n Format Pesan Salah, Contoh : "+trigger+"wangi1 furina");
                    await database.addLog(nomor, "Wangi 1", "Failed, Waifu tidak ditemukan",groupName);
                    if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                        await database.addPoint(nomor,20)
                    }
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nPoin anda tidak cukup untuk menggunakan fitur ini, jumlah poin anda saat ini : "+userData.point)
            }
        break;
        //wangi2
        case trigger+"wangi2":
            if(userData.point >= 20 || userData.admin == true || userData.owner == true || setting.bypassPoin == true){
                if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                    await database.cutPoint(nomor,20)
                }
                await database.addLog(nomor, "Wangi 2", "Process",groupName);
                if(eulawangi != ""){
                    const waifu = eulawangi.toUpperCase();
                    await database.addLog(nomor, "Wangi 2", "Success, Waifu :"+eulawangi,groupName);
                    chat.sendMessage(await copypaste.wangi2(waifu));
                }else{
                    message.reply("*"+namaBot+"*\n\n Format Pesan Salah, Contoh : "+trigger+"wangi2 furina");
                    await database.addLog(nomor, "Wangi 2", "Failed, Waifu tidak ditemukan",groupName);
                    if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                        await database.addPoint(nomor,20)
                    }
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nPoin anda tidak cukup untuk menggunakan fitur ini, jumlah poin anda saat ini : "+userData.point)
            }
        break;
        //wangi3
        case trigger+"wangi3":
            if(userData.point >= 20 || userData.admin == true || userData.owner == true || setting.bypassPoin == true){
                if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                    await database.cutPoint(nomor,20)
                }
                await database.addLog(nomor, "Wangi 3", "Process",groupName);
                if(eulawangi != ""){
                    const waifu = eulawangi.toUpperCase();
                    await database.addLog(nomor, "Wangi 3", "Success, Waifu :"+eulawangi,groupName);
                    chat.sendMessage(await copypaste.wangi3(waifu));
                }else{
                    message.reply("*"+namaBot+"*\n\n Format Pesan Salah, Contoh : "+trigger+"wangi3 furina");
                    await database.addLog(nomor, "Wangi 3", "Failed, Waifu tidak ditemukan",groupName);
                    if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                        await database.addPoint(nomor,20)
                    }
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nPoin anda tidak cukup untuk menggunakan fitur ini, jumlah poin anda saat ini : "+userData.point)
            }
        break;
        //wangi4
        case trigger+"wangi4":
            if(userData.point >= 20 || userData.admin == true || userData.owner == true || setting.bypassPoin == true){
                if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                    await database.cutPoint(nomor,20)
                }
                await database.addLog(nomor, "Wangi 4", "Process",groupName);
                if(eulawangi != ""){
                    const waifu = eulawangi.toUpperCase();
                    await database.addLog(nomor, "Wangi 4", "Success, Waifu :"+eulawangi,groupName);
                    chat.sendMessage(await copypaste.wangi4(waifu));
                }else{
                    message.reply("*"+namaBot+"*\n\n Format Pesan Salah, Contoh : "+trigger+"wangi4 furina");
                    await database.addLog(nomor, "Wangi 4", "Failed, Waifu tidak ditemukan",groupName);
                    if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                        await database.addPoint(nomor,20)
                    }
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nPoin anda tidak cukup untuk menggunakan fitur ini, jumlah poin anda saat ini : "+userData.point)
            }
        break;
        //wangifurry
        case trigger+"wangifurry":
            if(userData.point >= 20 || userData.admin == true || userData.owner == true || setting.bypassPoin == true){
                if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                    await database.cutPoint(nomor,20)
                }
                await database.addLog(nomor, "Wangi Furry", "Process",groupName);
                if(eulawangi != ""){
                    const waifu = eulawangi.toUpperCase();
                    await database.addLog(nomor, "Wangi Furry", "Success, Waifu :"+eulawangi,groupName);
                    chat.sendMessage(await copypaste.wangifurry(waifu));
                }else{
                    message.reply("*"+namaBot+"*\n\n Format Pesan Salah, Contoh : "+trigger+"wangifurry wedos");
                    await database.addLog(nomor, "Wangi Furry", "Failed, Waifu tidak ditemukan",groupName);
                    if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                        await database.addPoint(nomor,20)
                    }
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nPoin anda tidak cukup untuk menggunakan fitur ini, jumlah poin anda saat ini : "+userData.point)
            }
        break;

        //genshinwaifu
        case trigger+"genshinwaifu":
        case trigger+" genshinwaifu":
            if(userData.point >= 30 || userData.admin == true || userData.owner == true || setting.bypassPoin == true){
                if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                    await database.cutPoint(nomor,20)
                }
                await database.addLog(nomor, "Genshin Waifu", "Process",groupName);
                try {
                    res = await waifu.genshinwaifu();
                    const img = await MessageMedia.fromUrl(res, {unsafeMime:true});
                    if(img.filesize != null && img.filesize < 15000000){
                        chat.sendMessage(img);
                        await database.addLog(nomor, "Genshin Waifu", "Success",groupName);
                    }else{
                        message.reply("*"+namaBot+"*\n\nTerjadi Kesalahan");
                        await database.addLog(nomor, "Genshin Waifu", "Failed, Over Filesize",groupName);
                        if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                            await database.addPoint(nomor,30)
                        }
                    }
                } catch (error) {
                    message.reply("*"+namaBot+"*\n\nTerjadi Kesalahan");
                    await database.addLog(nomor, "Genshin Waifu", "Failed, error getting image",groupName);
                    if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                        await database.addPoint(nomor,30)
                    }
    
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nPoin anda tidak cukup untuk menggunakan fitur ini, jumlah poin anda saat ini : "+userData.point)
            }
        break;
        //HSR Waifu
        case trigger+"hsrwaifu":
        case trigger+" hsrwaifu":
            if(userData.point >= 30 || userData.admin == true || userData.owner == true || setting.bypassPoin == true){
                if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                    await database.cutPoint(nomor,20)
                }
                console.log(userData.admin)
                await database.addLog(nomor, "HSR Waifu", "Process",groupName);
                try {
                    res = await waifu.hsrwaifu();
                    const img = await MessageMedia.fromUrl(res, {unsafeMime:true});
                    if(img.filesize != null && img.filesize < 15000000){
                        chat.sendMessage(img);
                        await database.addLog(nomor, "HSR Waifu", "Success",groupName);
                    }else{
                        message.reply("*"+namaBot+"*\n\nTerjadi Kesalahan");
                        await database.addLog(nomor, "HSR Waifu", "Failed, Over Filesize",groupName);
                        if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                            await database.addPoint(nomor,30)
                        }
                    }
                } catch (error) {
                    message.reply("*"+namaBot+"*\n\nTerjadi Kesalahan");
                    await database.addLog(nomor, "HSR Waifu", "Failed, error getting image",groupName);
                    if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                        await database.addPoint(nomor,30)
                    }
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nPoin anda tidak cukup untuk menggunakan fitur ini, jumlah poin anda saat ini : "+userData.point)
            }
        break;
        //RandomWaifu
        case trigger+"randomwaifu":
        case trigger+" randomwaifu":
            if(userData.point >= 30 || userData.admin == true || userData.owner == true || setting.bypassPoin == true){
                if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                    await database.cutPoint(nomor,20)
                }
                await database.addLog(nomor, "Random Waifu", "Process",groupName);
                try {
                    res = await waifu.randomWaifuSfw();
                    const img = await MessageMedia.fromUrl(res);
                    if(img.filesize != null && img.filesize < 15000000){
                        chat.sendMessage(img);
                        await database.addLog(nomor, "Random Waifu", "Success",groupName);
                    }else{
                        message.reply("*"+namaBot+"*\n\nTerjadi Kesalahan");
                        await database.addLog(nomor, "Random Waifu", "Failed, Over Filesize",groupName);
                        if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                            await database.addPoint(nomor,30)
                        }
                    }
                } catch (error) {
                    message.reply("*"+namaBot+"*\n\nTerjadi Kesalahan");
                    await database.addLog(nomor, "Random Waifu", "Failed, error getting image",groupName);
                    if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                        await database.addPoint(nomor,30)
                    }
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nPoin anda tidak cukup untuk menggunakan fitur ini, jumlah poin anda saat ini : "+userData.point)
            }
        break;
        //Hentai
        case trigger+"hentai":
            if(userData.point >= 30 || userData.admin == true || userData.owner == true || setting.bypassPoin == true){
                if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                    await database.cutPoint(nomor,20);
                }
                if(userData.admin == false || userData.owner == false){
                    await database.addNewBlockedUser(nomor,2592000,"Mencoba Mengakses Fitur Terlarang","SYSTEM")
                }
                eula.sendMessage(setting.nomorOwner+"@c.us","User "+userData.number+" dengan nama "+userData.name+" mengakses hentai di chat : "+chat.name);
                await database.addLog(nomor, "Hentai", "Process",groupName);
                try {
                    res = await waifu.randomWaifuNsfw();
                    const img = await MessageMedia.fromUrl(res);
                    if(img.filesize != null && img.filesize < 15000000){
                        chat.sendMessage(img);
                        await database.addLog(nomor, "Hentai", "Success",groupName);
                    }else{
                        message.reply("*"+namaBot+"*\n\nTerjadi Kesalahan");
                        await database.addLog(nomor, "Random Waifu", "Failed, Over Filesize",groupName);
                        if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                            await database.addPoint(nomor,30)
                        }
                    }
                } catch (error) {
                    message.reply("*"+namaBot+"*\n\nTerjadi Kesalahan");
                    await database.addLog(nomor, "Hentai", "Failed, error getting image",groupName);
                    if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                        await database.addPoint(nomor,30)
                    }
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nPoin anda tidak cukup untuk menggunakan fitur ini, jumlah poin anda saat ini : "+userData.point)
            }
        break;
        //chatgpt
        case trigger+"chatgpt":
            if(userData.point >= 50 || userData.admin == true || userData.owner == true || setting.bypassPoin == true){
                if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                    await database.cutPoint(nomor,50);
                }
                await database.addLog(nomor, "Chat GPT", "Process",groupName);
                if(eulawangi != false){
                    res = await akuariapi.chatgpt(astawangi);
                    if(res != false){
                        chat.sendMessage("*"+namaBot+"*\n\n"+res);
                        await database.addLog(nomor, "Chat GPT", "Success",groupName);
                    }else{
                        message.reply("*"+namaBot+"*\n\n Fitur Error");
                        await database.addLog(nomor, "Chat GPT", "Failed, Fitur Error",groupName);
                        if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                            await database.addPoint(nomor,50)
                        }
                    }
                }else{
                    message.reply("*"+namaBot+"*\n\n Format Pesan Salah, Contoh : "+trigger+"chatgpt apa itu hentai");
                    await database.addLog(nomor, "Chat GPT", "Failed, Query Tidak Ditemukan",groupName);
                    if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                        await database.addPoint(nomor,50)
                    }
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nPoin anda tidak cukup untuk menggunakan fitur ini, jumlah poin anda saat ini : "+userData.point)
            }
        break;
        //bard
        case trigger+"bard":
            if(userData.point >= 50 || userData.admin == true || userData.owner == true || setting.bypassPoin == true){
                if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                    await database.cutPoint(nomor,50);
                }
                await database.addLog(nomor, "Bard AI", "Process",groupName);
                if(eulawangi != false){
                    res = await akuariapi.bard(astawangi);
                    if(res != false){
                        chat.sendMessage("*"+namaBot+"*\n\n"+res);
                        await database.addLog(nomor, "Bard AI", "Success",groupName);
                    }else{
                        message.reply("*"+namaBot+"*\n\n Fitur Error");
                        await database.addLog(nomor, "Bard AI", "Failed, Fitur Error",groupName);
                        if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                            await database.addPoint(nomor,50)
                        }
                    }
                }else{
                    message.reply("*"+namaBot+"*\n\n Format Pesan Salah, Contoh : "+trigger+"bard apa itu hentai");
                    await database.addLog(nomor, "Bard AI", "Failed, Query Tidak Ditemukan",groupName);
                    if(userData.admin == false && setting.bypassPoin == false || userData.owner == false && setting.bypassPoin == false){
                        await database.addPoint(nomor,50)
                    }
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nPoin anda tidak cukup untuk menggunakan fitur ini, jumlah poin anda saat ini : "+userData.point)
            }
        break;








        ///USER MENU
        //Rename
        case trigger+"rename":
            await database.addLog(nomor, "Rename", "Process",groupName);
            if(userData.rank == "silver" || userData.rank == "gold" || userData.admin == true || userData.owner == true){
                if(eulawangi != false){
                    if(!eulawangi.includes("<") || eulawangi != "eula" || eulawangi != "ahang" || eulawangi != "furina" || eulawangi != "silver wolf" || eulawangi != "asta" || eulawangi != "silverwolf"){
                        res = await database.changeName(nomor, astawangi);
                        if(res != false){
                            chat.sendMessage("*"+namaBot+"*\n\nNama anda telah diganti dari *"+userData.name+"* menjadi *"+astawangi+"*");
                            await database.addLog(nomor, "Rename", "Rename Success, from "+userData.name+" to "+astawangi,groupName);
                        }else{
                            chat.sendMessage("*"+namaBot+"*\n\nRename Gagal")
                            await database.addLog(nomor, "Rename", "Failed, Program Error",groupName);
                        }
                    }else{
                        chat.sendMessage("*"+namaBot+"*\n\nNama *"+astawangi+"* tidak diperbolehkan, silahkan coba nama lain!");
                        await database.addLog(nomor, "Rename", "Failed, user using blacklisted name : "+astawangi,groupName);
                    }
                }else{
                    chat.sendMessage("*"+namaBot+"*\n\nNama tidak boleh kosong, ketik "+trigger+"rename <nama anda>");
                    await database.addLog(nomor, "Rename", "Failed, nama kosong",groupName);
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nRank terlalu rendah untuk melakukan Rename, Rank minimal adalah Silver");
                await database.addLog(nomor, "Rename", "Failed, rank terlalu rendah",groupName);
            }
        break;


        ///GROUP MENU
        //group info
        case trigger+"groupinfo":
            await database.addLog(nomor, "Group Info", "Process",groupName);
            if(isGroup){
                const groupRegisterInfo = await database.checkGroupRegister(chat.id.user);
                let chatOwner, chatDescription, registerTime;
                registerTime = unixTimeFormatter(groupRegisterInfo.register_time)
                if(chat.owner === undefined){chatOwner = ""}else{chatOwner = chat.owner}
                if(chat.description === undefined){chatDescription = ""}else{chatDescription = chat.description}
                const msgin = "*->Informasi Grup<-*\nNama Grup : "+chat.name+"\nDiregister oleh : "+groupRegisterInfo.register_by+"\nDiregister Pada : "+registerTime+"\nDeskripsi : \n"+chatDescription+"\n\nOwner : "+chatOwner;
                chat.sendMessage("*"+namaBot+"*\n\n"+msgin);
                await database.addLog(nomor, "Group Info", "Success",groupName);
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nCommand ini Hanya Bisa digunakan dalam Grup");
                await database.addLog(nomor, "Group Info", "Failed, pesan tidak didalam grup",groupName);
            }
        break;


        ///Admin Menu
        //Unreguser
        case trigger+"unreguser":
            await database.addLog(nomor, "Unreg User", "Process",groupName);
            if(userData.admin == true || userData.owner == true){
                if(message.hasQuotedMsg){
                    const quotedMsg = await message.getQuotedMessage();
                    const kont = await quotedMsg.getContact();
                    const nomornya = kont.id.user;
                    let nom = nomornya.replaceAll("@","").replaceAll("-","").replaceAll(" ","").replaceAll("c.us","");
                    const data = await database.checkUserAvailable(nom);
                    if(data != false){
                        if(data.owner == false && data.admin == true && userData.owner == true){
                            await database.addLog(nomor, "Unreg User", "Success",groupName);
                            await database.deleteUser(nom)
                            chat.sendMessage("*"+namaBot+"*\n\nUnreg User "+data.number+" Berhasil")
                        }else if(data.owner == false && data.admin == false && userData.admin == true){
                            await database.addLog(nomor, "Unreg User", "Success",groupName);
                            await database.deleteUser(nom)
                            chat.sendMessage("*"+namaBot+"*\n\nUnreg User "+data.number+" Berhasil")
                        }else if(data.owner == false && data.admin == false && userData.owner == true){
                            await database.addLog(nomor, "Unreg User", "Success",groupName);
                            await database.deleteUser(nom)
                            chat.sendMessage("*"+namaBot+"*\n\nUnreg User "+data.number+" Berhasil")
                        }else{
                            chat.sendMessage("*"+namaBot+"*\n\nAkses Ditolak, Anda Tidak Bisa Unreg Nomor Owner!");
                            await database.addNewBlockedUser(nomor,86400,"Percobaan Mengunreg Owner","SYSTEM");
                            await database.addLog(nomor, "Unreg User", "Failed, Otorisasi Tidak Cukup",groupName);
                        }
                    }else{
                        chat.sendMessage("*"+namaBot+"*\n\nError, Nomor Tidak Ditemukan!");
                        await database.addLog(nomor, "Unreg User", "Failed, Nomor Tidak Ditemukan",groupName);
                    }
                }else{
                    if(eulawangi != false){
                        let nom = astawangi.replaceAll("@","").replaceAll("-","").replaceAll(" ","").replaceAll("c.us","");
                        const data = await database.checkUserAvailable(nom);
                        if(data != false){
                            if(data.owner == false && data.admin == true && userData.owner == true){
                                await database.addLog(nomor, "Unreg User", "Success",groupName);
                                await database.deleteUser(nom)
                                chat.sendMessage("*"+namaBot+"*\n\nUnreg User "+data.number+" Berhasil")
                            }else if(data.owner == false && data.admin == false && userData.admin == true){
                                await database.addLog(nomor, "Unreg User", "Success",groupName);
                                await database.deleteUser(nom)
                                chat.sendMessage("*"+namaBot+"*\n\nUnreg User "+data.number+" Berhasil")
                            }else if(data.owner == false && data.admin == false && userData.owner == true){
                                await database.addLog(nomor, "Unreg User", "Success",groupName);
                                await database.deleteUser(nom)
                                chat.sendMessage("*"+namaBot+"*\n\nUnreg User "+data.number+" Berhasil")
                            }else{
                                chat.sendMessage("*"+namaBot+"*\n\nAkses Ditolak, Anda Tidak Bisa Unreg Nomor Owner!");
                                await database.addNewBlockedUser(nomor,86400,"Percobaan Mengunreg Owner","SYSTEM");
                                await database.addLog(nomor, "Unreg User", "Failed, Otorisasi Tidak Cukup",groupName);
                            }
                        }else{
                            chat.sendMessage("*"+namaBot+"*\n\nError, Nomor Tidak Ditemukan!");
                            await database.addLog(nomor, "Unreg User", "Failed, Nomor Tidak Ditemukan",groupName);
                        }
                    }else{
                        await database.addLog(nomor, "Unreg User", "Failed, Format Salah",groupName);
                        chat.sendMessage("*"+namaBot+"*\n\nFormat Pesan Salah, "+trigger+"unregister <nomor>");
                    }
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nAkses Ditolak, Anda Bukan Admin!");
                await database.addLog(nomor, "Unreg User", "Failed, pengirim bukan admin/owner",groupName);
            }
        break;
        //ban
        case trigger+"ban":
            await database.addLog(nomor, "Ban User", "Process",groupName);
            if(userData.admin == true || userData.owner == true){
                if(eulawangi != false){
                    const arrayData = astawangi.split(" ");
                    const nban = arrayData[0].replaceAll("@","").replaceAll("-","").replaceAll(" ","").replaceAll("c.us","");
                    const durban = arrayData[1];
                    const alban = arrayData.slice(2).toString().replaceAll(","," ");
                    const cekdata = await database.checkUserAvailable(nban);
                    if(cekdata != false){
                        if(cekdata.owner == false){
                            const proban = await database.addNewBlockedUser(nban,durban,alban,userData.number+"/"+userData.name);
                            if(proban != false){
                                chat.sendMessage("*"+namaBot+"*\n\nBerhasil ban nomor "+nban);
                                await database.addLog(nomor, "Ban User", "Success, ban "+nban,groupName);
                            }else{
                                chat.sendMessage("*"+namaBot+"*\n\nProgram Error!");
                                await database.addLog(nomor, "Ban User", "Failed, Program Error",groupName);
                            }
                        }else{
                            chat.sendMessage("*"+namaBot+"*\n\nAkses Ditolak, tidak bisa ban nomor owner!");
                            await database.addNewBlockedUser(nomor,86400,"Percobaan Ban Owner","SYSTEM");
                            await database.addLog(nomor, "Ban User", "Failed, Percobaan ban nomor owner",groupName);
                        }
                    }else{
                        chat.sendMessage("*"+namaBot+"*\n\nNomor "+nban+" tidak ditemukan!");
                        await database.addLog(nomor, "Ban User", "Failed, nomor tidak ditemukan",groupName);
                    }
                }else{
                    await database.addLog(nomor, "Ban User", "Failed, Format Salah",groupName);
                    chat.sendMessage("*"+namaBot+"*\n\nFormat Pesan Salah, "+trigger+"ban <nomor>,<durasi ban dalam detik>,<alasan ban>");
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nAkses Ditolak, Anda Bukan Admin!");
                await database.addLog(nomor, "Ban User", "Failed, pengirim bukan admin/owner",groupName);
            }
        break;
        //unban
        case trigger+"unban":
            await database.addLog(nomor, "Unban User", "Process",groupName);
            if(userData.admin == true || userData.owner == true){
                if(eulawangi != false){
                    const nom = eulawangi.replaceAll("@","").replaceAll("-","").replaceAll(" ","").replaceAll("c.us","");
                    const cekdata = await database.checkUserAvailable(nom);
                    if(cekdata != false){
                        res = await database.deleteBlockedUser(nom);
                        if(res != false){
                            chat.sendMessage("*"+namaBot+"*\n\nBerhasil ban nomor "+nom);
                            await database.addLog(nomor, "Unban User", "Success, unban "+nom,groupName);
                        }else{
                            chat.sendMessage("*"+namaBot+"*\n\nProgram Error!");
                            await database.addLog(nomor, "Unban User", "Failed, Program Error",groupName);
                        }
                    }else{
                        chat.sendMessage("*"+namaBot+"*\n\nNomor "+nom+" tidak ditemukan!");
                        await database.addLog(nomor, "Unban User", "Failed, nomor tidak ditemukan",groupName);
                    }
                }else{
                    await database.addLog(nomor, "Unban User", "Failed, Format Salah",groupName);
                    chat.sendMessage("*"+namaBot+"*\n\nFormat Pesan Salah, "+trigger+"unban <nomor>");
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nAkses Ditolak, Anda Bukan Admin!");
                await database.addLog(nomor, "Unban User", "Failed, pengirim bukan admin/owner",groupName);
            }
        break;
        //addpoint
        case trigger+"addpoin":
            await database.addLog(nomor, "Add Poin", "Process",groupName);
            if(userData.admin == true || userData.owner == true){
                if(eulawangi != false){
                    const dataarray = eulawangi.split(" ");
                    const nom = dataarray[0].replaceAll("@","").replaceAll("-","").replaceAll(" ","").replaceAll("c.us","");
                    const jumpoin = dataarray[1];
                    res = await database.addPoint(nom, jumpoin);
                    if(res != false){
                        chat.sendMessage("*"+namaBot+"*\n\nBerhasil menambah "+jumpoin+" poin ke nomor "+nom);
                        await database.addLog(nomor, "Add Poin", "Success, Add "+jumpoin+" point to "+nom,groupName);
                    }else{
                        chat.sendMessage("*"+namaBot+"*\n\nData Tidak Valid!");
                        await database.addLog(nomor, "Add Poin", "Failed, Data Invalid",groupName);
                    }
                }else{
                    await database.addLog(nomor, "Add Poin", "Failed, Format Salah",groupName);
                    chat.sendMessage("*"+namaBot+"*\n\nFormat Pesan Salah, "+trigger+"addpoin <nomor>,<poin tambah>");
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nAkses Ditolak, Anda Bukan Admin!");
                await database.addLog(nomor, "Add Poin", "Failed, pengirim bukan admin/owner",groupName);
            }
        break;
        //userlist
        case trigger+"userlist":
            await database.addLog(nomor, "User List", "Process",groupName);
            if(userData.admin == true || userData.owner == true){
                res = await database.getUserList();
                let datanya = "";
                for(let a=0;a<res.length;a++){
                    datanya = datanya + (a+1)+". "+res[a]['number']+" - "+res[a]["name"]+"\n";
                }
                chat.sendMessage("*"+namaBot+"*\n\n"+datanya);
                await database.addLog(nomor, "User List", "Success");
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nAkses Ditolak, Anda Bukan Admin!");
                await database.addLog(nomor, "User List", "Failed, pengirim bukan admin/owner",groupName);
            }
        break;
        //setrank
        case trigger+"setrank":
            await database.addLog(nomor, "Set Rank", "Process",groupName);
            if(userData.admin == true || userData.owner == true){
                if(eulawangi != false){
                    const dataarray = eulawangi.split(" ");
                    const nom = dataarray[0].replaceAll("@","").replaceAll("-","").replaceAll(" ","").replaceAll("c.us","");
                    const rank = dataarray[1];
                    if(rank == "bronze" || rank == "silver" || rank == "gold"){
                        res = await database.checkUserAvailable(nom);
                        if(res != false){
                            if(res.rank != rank){
                                const rubahrank = await database.setRank(nom, rank);
                                if(rubahrank != false){
                                    chat.sendMessage("*"+namaBot+"*\n\nBerhasil mengubah rank "+nom+" dari "+res.rank+" menjadi "+rank);
                                    await database.addLog(nomor, "Set Rank", "Success",groupName);
                                }else{
                                    chat.sendMessage("*"+namaBot+"*\n\nSistem Error");
                                    await database.addLog(nomor, "Set Rank", "Failed, Setrank Function Error");
                                }
                            }else{
                                chat.sendMessage("*"+namaBot+"*\n\nSetrank Gagal, Rank user "+nom+" sudah "+rank);
                                await database.addLog(nomor, "Set Rank", "Failed, Rank user sudah "+rank,groupName);
                            }
                        }else{
                            chat.sendMessage("*"+namaBot+"*\n\nNomor tidak ditemukan!");
                            await database.addLog(nomor, "Set Rank", "Failed, Nomor Tidak Ditemukan",groupName);
                        }
                    }else{
                        chat.sendMessage("*"+namaBot+"*\n\nRank Tidak Valid, (bronze,silver,gold)!");
                        await database.addLog(nomor, "Set Rank", "Failed, Rank input Invalid",groupName);
                    }
                }else{
                    await database.addLog(nomor, "Set Rank", "Failed, Format Salah",groupName);
                    chat.sendMessage("*"+namaBot+"*\n\nFormat Pesan Salah, "+trigger+"setrank <nomor>,<bronze/silver/gold>");
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nAkses Ditolak, Anda Bukan Admin!");
                await database.addLog(nomor, "Set Rank", "Failed, pengirim bukan admin/owner",groupName);
            }
        break;


        ///Admin Menu
        //setadmin
        case trigger+"setadmin":
            await database.addLog(nomor, "Set Admin", "Process",groupName);
            if(userData.owner == true){
                if(eulawangi != false){
                    const nom = astawangi.replaceAll("@","").replaceAll("-","").replaceAll(" ","").replaceAll("c.us","");
                    res = await database.checkUserAvailable(nom);
                    if(res != false){
                        if(res.admin == false){
                            const rubahadmin = await database.setAdmin(nom);
                            if(rubahadmin != false){
                                chat.sendMessage("*"+namaBot+"*\n\nBerhasil Merubah "+nom+" menjadi Admin");
                                await database.addLog(nomor, "Set Admin", "Success");
                            }else{
                                chat.sendMessage("*"+namaBot+"*\n\nSistem Error");
                                await database.addLog(nomor, "Set Admin", "Failed, Set Admin Function Error");
                            }
                        }else{
                            chat.sendMessage("*"+namaBot+"*\n\nSetadmin Gagal, user adalah admin");
                            await database.addLog(nomor, "Set Admin", "Failed, user sudah menjadi admin");
                        }
                    }else{
                        chat.sendMessage("*"+namaBot+"*\n\nNomor tidak ditemukan!");
                        await database.addLog(nomor, "Set Admin", "Failed, Nomor Tidak Ditemukan",groupName);
                    }
                }else{
                    await database.addLog(nomor, "Set Admin", "Failed, Format Salah",groupName);
                    chat.sendMessage("*"+namaBot+"*\n\nFormat Pesan Salah, "+trigger+"setadmin <nomor>");
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nAkses Ditolak, Anda Bukan Owner!");
                await database.addLog(nomor, "Set Admin", "Failed, pengirim bukan owner",groupName);
            }
        break;
        //unadmin
        case trigger+"unadmin":
            await database.addLog(nomor, "UnAdmin", "Process",groupName);
            if(userData.owner == true){
                if(eulawangi != false){
                    const nom = astawangi.replaceAll("@","").replaceAll("-","").replaceAll(" ","").replaceAll("c.us","");
                    res = await database.checkUserAvailable(nom);
                    if(res != false){
                        if(res.admin == true){
                            const rubahadmin = await database.setNoAdmin(nom);
                            if(rubahadmin != false){
                                chat.sendMessage("*"+namaBot+"*\n\nBerhasil Merubah "+nom+" menjadi Bukan Admin");
                                await database.addLog(nomor, "UnAdmin", "Success");
                            }else{
                                chat.sendMessage("*"+namaBot+"*\n\nSistem Error");
                                await database.addLog(nomor, "UnAdmin", "Failed, Set Admin Function Error");
                            }
                        }else{
                            chat.sendMessage("*"+namaBot+"*\n\nUnadmin Gagal, user bukan admin");
                            await database.addLog(nomor, "UnAdmin", "Failed, user bukan admin");
                        }
                    }else{
                        chat.sendMessage("*"+namaBot+"*\n\nNomor tidak ditemukan!");
                        await database.addLog(nomor, "UnAdmin", "Failed, Nomor Tidak Ditemukan",groupName);
                    }
                }else{
                    await database.addLog(nomor, "UnAdmin", "Failed, Format Salah",groupName);
                    chat.sendMessage("*"+namaBot+"*\n\nFormat Pesan Salah, "+trigger+"unadmin <nomor>");
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nAkses Ditolak, Anda Bukan Owner!");
                await database.addLog(nomor, "UnAdmin", "Failed, pengirim bukan owner",groupName);
            }
        break;
        //openmode
        case trigger+"openmode":
            if(userData.owner == true){

            }else{

            }
        break;
        //blockcmd
        case trigger+"blockcmd":
            if(userData.owner == true){

            }else{

            }
        break;
        //allownsfw
        case trigger+"allownsfw":
            if(userData.owner == true){

            }else{

            }
        break;
        //setinfo
        case trigger+"setinfo":
            await database.addLog(nomor, "Set Info", "Process",groupName);
            if(userData.owner == true){
                if(eulawangi != false){
                    res = await database.updateMenuInfo(astawangi);
                    if(res != false){
                        chat.sendMessage("*"+namaBot+"*\n\nBerhasil merubah info menu");
                        await database.addLog(nomor, "Set Info", "Success");
                    }else{
                        chat.sendMessage("*"+namaBot+"*\n\nSistem Error");
                        await database.addLog(nomor, "Set Info", "Failed, Set Info Function Error");
                    }
                }else{
                    chat.sendMessage("*"+namaBot+"*\n\nFormat Pesan Salah, "+trigger+"setinfo <menuinfo>");
                    await database.addLog(nomor, "Set Info", "Failed, data kosong",groupName);
                }
            }else{
                chat.sendMessage("*"+namaBot+"*\n\nAkses Ditolak, Anda Bukan Owner!");
                await database.addLog(nomor, "Set Info", "Failed, not owner",groupName);
            }
        break;


        ///Testing Segment
        //Test Danbooru
        case trigger+"danbo":
            try {
                res = await MessageMedia.fromUrl("https://cdn.donmai.us/original/14/ba/__furina_genshin_impact_drawn_by_6u_eternal_land__14ba85e38c3f517a3feab0647e9d00e0.jpg")
                //chat.sendMessage(res);
                console.log(res)
            } catch (error) {
                console.log(error)
            }
        break;
        

        //Not Found
        default:
            chat.sendMessage("*"+namaBot+"*\n\nCommand *"+command+"* tidak ditemukan, ketik "+trigger+"menu untuk menampilkan menu!");
            await database.addLog(nomor,"Default Message Handle","Command Not Found "+command)

    }
}

module.exports = eulaLawrence