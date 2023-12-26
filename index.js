const { Client, LocalAuth, MessageMedia, ChatTypes, ClientInfo } = require('whatsapp-web.js');
const webqr = require("qr-image")
const qrcode = require('qrcode-terminal');
const axios = require ('axios');
const fs = require('fs');
const express = require('express')
const webapp = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const database = require("./database")
const commandHandle = require("./eula");
database.addSystemLog("Starting..")

database.addSystemLog("Load Configuration File")
const globalSetting = JSON.parse(fs.readFileSync("./config.json",{ encoding: 'utf8', flag: 'r' }));

//DevKit Fucntion
const dev = async(eula, message, chat) => {
    console.log("message type : "+message.type);
    console.log("message body : "+message.body);
    console.log("message to : "+message.to);
}

//OS Detection
let ffmpegPath="",chromePath="";
if (process.platform === 'win32') {
    chromePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";
    ffmpegPath = "C:/ffmpeg/bin/ffmpeg.exe" //Replace this path if FFMPEG Installation is in another directory
    database.addSystemLog('Set Path for Windows');
} else if (process.platform === 'darwin') {
    //MACOS NOT TESTED!
    chromePath = "/Applications/Google Chrome.app";
    ffmpegPath = "/usr/local/bin/ffmpeg";
    database.addSystemLog('Set Path for MACOS');
} else if (process.platform === 'linux') {
    chromePath = "/usr/bin/google-chrome";
    ffmpegPath = "/usr/bin/ffmpeg"
    database.addSystemLog('Set Path for Linux');
} else {
    database.addSystemLog(setting.namaBot+' OS Invalid, Stopping Program!');
    process.exit();
}


//Client
database.addSystemLog("Creating new WhatsApp Client")
let eulaClientReady = 0, qrGenerate = "WAIT", qrnya
const eula = new Client({
    puppeteer: {
        args: ['--disable-gpu', '--no-sandbox'],
          executablePath: chromePath,
          headless:false
        
    },  
    authStrategy: new LocalAuth({ clientId: "EulaBOT",dataPath:"./.EULA_SESSION" }),
    ffmpegPath: ffmpegPath
});

eula.on('qr', qr => {
    console.log('Scan QR Code');
    qrcode.generate(qr, {small: true});
    qrnya = webqr.image(qr, { type: 'png', size: 8 })
    qrGenerate = "GENERATED";
});

eula.on('authenticated', () => {
    const setting = JSON.parse(fs.readFileSync("./config.json",{ encoding: 'utf8', flag: 'r' }));
    database.addSystemLog('Autentikasi '+setting.namaBot+' Berhasil');
});

eula.on('ready', () => {
    eulaClientReady = 1;
    const setting = JSON.parse(fs.readFileSync("./config.json",{ encoding: 'utf8', flag: 'r' }));
    database.addSystemLog(setting.namaBot+' siap Dipakai!');
    eula.sendMessage(setting.nomorOwner+"@c.us", setting.namaBot+' Activated!');
    qrGenerate = "READY"
    //messageMain(eula,setting.namaBot+" Diaktifkan di "+eula.info.wid.user+" dengan nama "+eula.info.pushname+", \n\n*Siap Menerima Pesan!*");
});

eula.initialize();

eula.on('message', async(message) => {
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
    const ownerNumber = setting.nomorOwner;

    //DEVKIT
    //await dev(eula, message, chat)

    //True if message send to group
    let isGroup;if(message.from.includes('@g.us')){isGroup = true;}else{isGroup = false;}

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

    //Get Userdata From DB
    const userData = await database.checkUserAvailable(nomor);
    const blockedUser = await database.checkBlockedUser(nomor);
    const groupData = await database.checkGroupRegister(chat.id.user)
    const blockedGroup = await database.checkBlockedGroup(chat.id.user);

    //Message Operation
    if(isGroup == true){
        //Sender in Group
        if(groupData != false){
            //Group Registered
            if(blockedGroup != false){
                //Group Blocked
                if(Array.from(isiPesan)[0] == trigger){
                    const groupBlockedRemaining = await database.getGroupBlockRemaining(chat.id.user);
                    chat.sendMessage("*"+namaBot+"*\n\n"+"Group ini dibanned oleh *"+blockedGroup.block_by+"* \nselama : *"+groupBlockedRemaining+"*\ndengan alasan : *"+blockedGroup.block_reason+"*");
                }
            }else{
                //Group not Blocked
                if(command != ""){
                    if(userData != false){
                        //user is registeder
                        if(Array.from(isiPesan)[0] == trigger){
                            if(blockedUser != false){
                                //User Blocked
                                const groupBlockedRemaining = await database.getUserBlockRemaining(nomor);
                                chat.sendMessage("*"+namaBot+"*\n\n"+"Nomor anda dibanned oleh *"+blockedUser.block_by+"* \nselama : *"+groupBlockedRemaining+"*\ndengan alasan : *"+blockedUser.block_reason+"*");
                            }else{
                                //User not Blocked
                                await commandHandle(eula,message);
                                await database.addHit(nomor)
                            }
                        }else{

                        }
                    }else{
                        //user not registered
                        if(command == trigger+"register"){
                            if(eulawangi == ""){
                                message.reply("*"+namaBot+"*\n\nNama tidak boleh kosong!");
                                const media = await MessageMedia.fromFilePath("./image/help-image/register.jpeg");
                                chat.sendMessage(media,{caption:"Tulis seperti pada gambar"});
                            }else{
                                if(eulawangi == "ahang" && nomor != ownerNumber){
                                    message.reply("*"+namaBot+"*\n\n"+"DILARANG MEMAKAI NAMA OWNER!")
                                }else if(eulawangi == "eula" || eulawangi == "asta" || eula == "silver wolf" || eula == "silverwolf" || eula == "furina"){
                                    message.reply("*"+namaBot+"*\n\n"+"NAMA TIDAK VALID!")
                                }else{
                                    const registerProcess = await database.addNewUser(nomor, astawangi);
                                    if(registerProcess == true){
                                        chat.sendMessage("*"+namaBot+"*\n\nNomor anda telah terdaftar dengan nama : *"+astawangi+"*\nketik "+trigger+"menu untuk menampilkan menu bot!")
                                    }
                                }
                            }
                        }else{
                            if(Array.from(isiPesan)[0] == trigger){
                                const media = await MessageMedia.fromFilePath("./image/help-image/register.jpeg");
                                chat.sendMessage("*"+namaBot+"*\n\n"+"Mohon Maaf Nomor anda belum terdaftar, lakukan registrasi seperti gambar berikut!");
                                chat.sendMessage(media);
                            }
                        }
                    }
                }else{
                    
                }
            }
        }else{
            //Group not registered
            if(command == trigger+"groupreg" || command == trigger+"groupregister"){
                await database.addLog(nomor, "Register Group","Process", chat.name)
                //Register Message
                if(userData != false){
                    //if user registered
                    if(isGroupAdmin == true){
                        //Registrator is Group Admin
                        const registerProcess = await database.addGroup(chat.id.user,chat.name,userData.number);
                        if(registerProcess != false){
                            await database.addLog(nomor, "Register Group","Success", chat.name)
                            chat.sendMessage("*"+namaBot+"*\n\nRegistrasi Group Berhasil!");
                        }else{
                            await database.addLog(nomor, "Register Group","Fail", chat.name)
                            chat.sendMessage("*"+namaBot+"*\n\nRegistrasi Group gagal, hubungi owner untuk info lebih lanjut!");
                        }
                    }else{
                        //Registrator not Group Admin
                        chat.sendMessage("*"+namaBot+"*\n\nAkses Ditolak, anda bukan admin group!");
                    }
                }else{
                    //if user not registered
                    chat.sendMessage("*"+namaBot+"*\n\nAkses Ditolak, nomor anda belum terdaftar. Registrasi nomor anda terlebih dahulu melalui Private Chat dengan mengetik *"+trigger+"register <nama>*")
                }
            }else{
                //General Message
                if(Array.from(isiPesan)[0] == trigger){
                    chat.sendMessage("*"+namaBot+"*\n\nGroup Belum teregistrasi, ketik *"+trigger+"groupreg* untuk melakukan registrasi group");
                }
            }
        }
    }else{
        //Sender not in Group
        if(userData != false){
            //User Registered
            if(Array.from(isiPesan)[0] == trigger){
                //Message is command
                if(blockedUser != false){
                    //User Blocked
                    const userBlockedRemaining = await database.getUserBlockRemaining(nomor);
                    chat.sendMessage("*"+namaBot+"*\n\n"+"Nomor anda dibanned oleh *"+blockedUser.block_by+"* \nselama : *"+userBlockedRemaining+"*\ndengan alasan : *"+blockedUser.block_reason+"*");
                }else{
                    //User not Blocked
                    await commandHandle(eula,message);
                    await database.addHit(nomor)
                }
            }else{
                //Message not command
                chat.sendMessage("*"+namaBot+"*\n\nKetik "+trigger+"menu untuk menampilkan menu!\n\n*admin tidak bisa dichat dari sini ya");
            }
        }else{
            //User not Registered
            if(Array.from(isiPesan)[0] == trigger){
                if(command == trigger+"register"){
                    if(eulawangi == ""){
                        message.reply("*"+namaBot+"*\n\nNama tidak boleh kosong!");
                        const media = await MessageMedia.fromFilePath("./image/help-image/register.jpeg");
                        chat.sendMessage(media,{caption:"Tulis seperti pada gambar"});
                    }else{
                        if(eulawangi == "ahang" && nomor != "62895395391278"){
                            message.reply("*"+namaBot+"*\n\n"+"DILARANG MEMAKAI NAMA OWNER!")
                        }else if(eulawangi == "eula" || eulawangi == "asta" || eulawangi == "silver wolf" || eulawangi == "silverwolf" || eulawangi == "furina"){
                            message.reply("*"+namaBot+"*\n\n"+"DILARANG MEMAKAI NAMA INI!")
                        }else{
                            const registerProcess = await database.addNewUser(nomor, astawangi);
                            if(registerProcess == true){
                                chat.sendMessage("*"+namaBot+"*\n\nNomor anda telah terdaftar dengan nama : *"+astawangi+"*\nketik "+trigger+"menu untuk menampilkan menu bot!")
                            }
                        }
                    }
                }else if(command == trigger+"help" || command == trigger+"bantuan"){
    
                }else{
                    const media = await MessageMedia.fromFilePath("./image/help-image/register.jpeg");
                    chat.sendMessage("*"+namaBot+"*\n\n"+"Mohon Maaf Nomor anda belum terdaftar, lakukan registrasi seperti gambar berikut!");
                    chat.sendMessage(media);
                }
            }else{
                //if(isGroup != true){
                //    chat.sendMessage("*"+namaBot+"*\n\n"+"Mohon Maaf, Nomor anda belum terdaftar ketik "+trigger+"register <nama> untuk melakukan registrasi");
                //}
            }
        }
    }

})

//QR Generator
webapp.get('/qr', (req, res) => {
    database.addSystemLog("QR Requested via HTTP")
    if(qrGenerate == "WAIT"){
        res.send("Waiting!")
    }else if(qrGenerate == "READY"){
        res.send("Client Ready!")
    }else{
        res.setHeader('Content-type', 'image/png');
        qrnya.pipe(res)
    }
});

webapp.listen(globalSetting.httpPort, () => {
    database.addSystemLog(`WEB Server berlari di port ${globalSetting.httpPort}`)
});

const pointReset = async() => {
    if(eulaClientReady == 1){
        const userData = await database.getUserList();
        if(userData.length > 0){
            for(a=0;a<userData.length;a++){
                const nomor = userData[a]['number']
                if(userData[a]['point'] < 500 && userData[a]["rank"] == "bronze"){
                    await database.addPoint(nomor, 1)
                }else if(userData[a]['point'] < 1000 && userData[a]["rank"] == "silver"){
                    await database.addPoint(nomor, 1)
                }else if(userData[a]['point'] < 5000 && userData[a]["rank"] == "gold"){
                    await database.addPoint(nomor, 1)
                }
            }
            database.addSystemLog("Updating Point Success")
        }else{
            database.addSystemLog("Updating Point Failed, User data is empty")
        }
    }else{
        database.addSystemLog("Updating Point Failed, Client not Ready")
    }
}
setInterval(pointReset, 432000);