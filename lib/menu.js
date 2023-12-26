const database = require("../database");
const os = require("os");
const moment = require("moment-timezone")
const axios = require ('axios');
const fs = require('fs');

async function getWaktu() {
    return moment().tz("GMT+7").format("HH:mm");
  }  

async function getWaktuHari() {
    const waktu = await getWaktu()
    if (waktu >= "06:00" && waktu <= "10:00") {
      return "Selamat Pagi";
    } else if (waktu >= "10:00" && waktu <= "15:00") {
      return "Selamat Siang";
    } else if (waktu >= "15:00" && waktu <= "18:00") {
      return "Selamat Sore";
    } else {
      return "Selamat Malam";
    }
  }
  
moment.locale('id');
function unixTimeFormatter(unixTime) {
  const formattedDate = moment.unix(unixTime).format('dddd, DD MMMM YYYY');
  return formattedDate;
}

function getUptime() {
    const uptimeInSeconds = os.uptime();
    const days = Math.floor(uptimeInSeconds / (3600 * 24));
    const hours = Math.floor((uptimeInSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeInSeconds % 60);
  
    return `${days} hari, ${hours} jam, ${minutes} menit, ${seconds} detik`;
}

function getOsName() {
    return os.platform();
}

function getCpuName() {
    return os.cpus()[0].model;
}

const menu = async(nomor) => {
    const userData = await database.checkUserAvailable(nomor);
    const jumlahUser = await database.getNumberOfUser();
    const jumlahGroup = await database.getNumberOfGroup();
    const info = await database.getMenuInfo();
    const setting = JSON.parse(fs.readFileSync("./config.json",{ encoding: 'utf8', flag: 'r' }));
    const trigger = setting.trigger;
    const namaBot = setting.namaBot;

    let uIsAdmin;if(userData.admin == true){uIsAdmin = "YA"}else{uIsAdmin = "TIDAK"}
    let uIsOwner;if(userData.owner == true){uIsOwner = "YA"}else{uIsOwner = "TIDAK"}


    const menuData = `*`+namaBot+`*

`+await getWaktuHari()+`, *`+userData.name+`*

----------
*User Info* :
Nama : `+userData.name+`
Waktu Registrasi : `+unixTimeFormatter(userData.register_time)+`
Rank : `+userData.rank+`
Poin : `+userData.point+`
Admin : `+uIsAdmin+`
Owner : `+uIsOwner+`
Hit : `+userData.hit+`

----------
*Bot Info* : 
Nama BOT : `+namaBot+`
Owner : `+setting.owner+`
WA Owner : `+setting.nomorOwner+`
Pengguna : `+jumlahUser+`
Group : `+jumlahGroup+`
Server Uptime : `+getUptime()+`
Platform : `+getOsName()+`
CPU : `+getCpuName()+`

----------
*Menu* : 
`+trigger+`stiker
`+trigger+`stimg
`+trigger+`look
`+trigger+`ssweb
`+trigger+`ytmp4
`+trigger+`ytmp3
`+trigger+`ttmp4
`+trigger+`ttmp3
`+trigger+`ttstalk
`+trigger+`igpost
`+trigger+`igreel
`+trigger+`jadwalsholat
`+trigger+`chatgpt
`+trigger+`bard
`+trigger+`wangi1
`+trigger+`wangi2
`+trigger+`wangi3
`+trigger+`wangi4
`+trigger+`wangifurry
`+trigger+`genshinwaifu
`+trigger+`hsrwaifu
`+trigger+`randomwaifu

----------
*Group Menu* :
`+trigger+`groupinfo

----------
*User Menu* : 
`+trigger+`rename

----------
*Admin Menu* :
`+trigger+`cekuser
`+trigger+`unreguser
`+trigger+`block
`+trigger+`unblock
`+trigger+`addpoint
`+trigger+`userlist
`+trigger+`setrank

----------
*Owner Menu* :
`+trigger+`setadmin
`+trigger+`unadmin
`+trigger+`openmode
`+trigger+`blockcmd
`+trigger+`allownsfw
`+trigger+`setinfo

----------    
*Info* :   
`+info+`

`

return menuData
}

module.exports = menu