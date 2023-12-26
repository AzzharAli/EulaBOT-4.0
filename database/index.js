const fs = require("fs");
const moment = require('moment');

function timestamp() {
    const currentTime = moment();
    const timestampInSeconds = currentTime.unix();
    return timestampInSeconds;
}


//USER MANAGE FUNCTION

const checkUserAvailable = async(nomor) =>{
    let json = await fs.readFileSync("./database/user.json","utf-8");
    let array = JSON.parse(json);
    let jumlahUser = array.length;
    let found = false;
    for(let a=0;a<jumlahUser;a++){
        if(array[a]["number"] == nomor){
            found = array[a];
        }
    }
    return found;
    //OK
}

const addNewUser = async(nomor, nama) => {
    let json = await fs.readFileSync("./database/user.json","utf-8");
    let array = JSON.parse(json);
    let jumlah = array.length;
    let owner;let admin;
    if(jumlah == 0){owner=true;admin=true}else{owner=false;admin=false}
    const template_data = {"number":nomor,"name":nama,"rank":"bronze","point":500,"hit":0, "log":[],"admin":admin, "owner":owner, "register_time":timestamp()}
    array.push(template_data);
    json = JSON.stringify(array);
    await fs.writeFileSync("./database/user.json",json,"utf-8");
    return true
    //OK
}

const deleteUser = async(nomor) => {
    let json = await fs.readFileSync("./database/user.json","utf-8");
    let array = JSON.parse(json);
    let jumlahUser = array.length;
    for(let a=0;a<jumlahUser;a++){
        if(array[a]["number"] == nomor){
            array.splice(a, 1);
            json = JSON.stringify(array);
            await fs.writeFileSync("./database/user.json",json,"utf-8");
            return true
        }
    }
    return false
    //OK
}

const setRank = async(nomor, rank)=> {
    let json = await fs.readFileSync("./database/user.json","utf-8");
    let array = JSON.parse(json);
    let jumlahUser = array.length;
    for(let a=0;a<jumlahUser;a++){
        if(array[a]["number"] == nomor){
            array[a]["rank"] = rank;
            json = JSON.stringify(array);
            await fs.writeFileSync("./database/user.json",json,"utf-8");
            return true
        }
    }
    return false
    //OK
}

const setbronze = async(nomor)=> {
    let json = await fs.readFileSync("./database/user.json","utf-8");
    let array = JSON.parse(json);
    let jumlahUser = array.length;
    for(let a=0;a<jumlahUser;a++){
        if(array[a]["number"] == nomor){
            array[a]["rank"] = "bronze";
            json = JSON.stringify(array);
            await fs.writeFileSync("./database/user.json",json,"utf-8");
            return true
        }
    }
    return false
    //OK
}

const setsilver = async(nomor)=> {
    let json = await fs.readFileSync("./database/user.json","utf-8");
    let array = JSON.parse(json);
    let jumlahUser = array.length;
    for(let a=0;a<jumlahUser;a++){
        if(array[a]["number"] == nomor){
            array[a]["rank"] = "silver";
            json = JSON.stringify(array);
            await fs.writeFileSync("./database/user.json",json,"utf-8");
            return true
        }
    }
    return false
    //OK
}

const setgold = async(nomor)=> {
    let json = await fs.readFileSync("./database/user.json","utf-8");
    let array = JSON.parse(json);
    let jumlahUser = array.length;
    for(let a=0;a<jumlahUser;a++){
        if(array[a]["number"] == nomor){
            array[a]["rank"] = "gold";
            json = JSON.stringify(array);
            await fs.writeFileSync("./database/user.json",json,"utf-8");
            return true
        }
    }
    return false
    //OK
}

const changeName = async(nomor, namaBaru) => {
    let json = await fs.readFileSync("./database/user.json","utf-8");
    let array = JSON.parse(json);
    let jumlahUser = array.length;
    for(let a=0;a<jumlahUser;a++){
        if(array[a]["number"] == nomor){
            array[a]["name"] = namaBaru;
            json = JSON.stringify(array);
            await fs.writeFileSync("./database/user.json",json,"utf-8");
            return true
        }
    }
    return false
    //OK
}

const addPoint = async(nomor, jumlahTambah) => {
    let json = await fs.readFileSync("./database/user.json","utf-8");
    let array = JSON.parse(json);
    let jumlahUser = array.length;
    for(let a=0;a<jumlahUser;a++){
        if(array[a]["number"] == nomor){
            const jumlahSekarang = array[a]["point"]+parseInt(jumlahTambah);
            array[a]["point"] = jumlahSekarang;
            json = JSON.stringify(array);
            await fs.writeFileSync("./database/user.json",json,"utf-8");
            return true
        }
    }
    return false
    //OK
}
const cutPoint = async(nomor, jumlahKurang) => {
    let json = await fs.readFileSync("./database/user.json","utf-8");
    let array = JSON.parse(json);
    let jumlahUser = array.length;
    for(let a=0;a<jumlahUser;a++){
        if(array[a]["number"] == nomor){
            const jumlahSekarang = array[a]["point"]-parseInt(jumlahKurang);
            array[a]["point"] = jumlahSekarang;
            json = JSON.stringify(array);
            await fs.writeFileSync("./database/user.json",json,"utf-8");
            return true
        }
    }
    return false
    //OK
}

const addHit = async(nomor) => {
    let json = await fs.readFileSync("./database/user.json","utf-8");
    let array = JSON.parse(json);
    let jumlahUser = array.length;
    for(let a=0;a<jumlahUser;a++){
        if(array[a]["number"] == nomor){
            const jumlahSekarang = array[a]["hit"]+1;
            array[a]["hit"] = jumlahSekarang;
            json = JSON.stringify(array);
            await fs.writeFileSync("./database/user.json",json,"utf-8");
            return true
        }
    }
    return false
    //OK
}

const cutHit = async(nomor) => {
    let json = await fs.readFileSync("./database/user.json","utf-8");
    let array = JSON.parse(json);
    let jumlahUser = array.length;
    for(let a=0;a<jumlahUser;a++){
        if(array[a]["number"] == nomor){
            const jumlahSekarang = array[a]["hit"]-1;
            array[a]["hit"] = jumlahSekarang;
            json = JSON.stringify(array);
            await fs.writeFileSync("./database/user.json",json,"utf-8");
            return true
        }
    }
    return false
    //OK
}

const addLog = async(nomor, activity, status, group) => {
    let template = {"time":timestamp(),"activity":activity,"group":group,"status":status}
    let json = await fs.readFileSync("./database/user.json","utf-8");
    let array = JSON.parse(json);
    let jumlahUser = array.length;
    for(let a=0;a<jumlahUser;a++){
        if(array[a]["number"] == nomor){
            const temp = array[a]["log"];
            temp.push(template);
            array[a]["log"] = temp;
            json = JSON.stringify(array);
            await fs.writeFileSync("./database/user.json",json,"utf-8");
            const userData = await checkUserAvailable(nomor);
            await addSystemLog(nomor+"-"+userData.name+" request "+activity+" : "+status)
            return true
        }
    }
    return false
    //OK
}

const setAdmin = async(nomor) => {
    let json = await fs.readFileSync("./database/user.json","utf-8");
    let array = JSON.parse(json);
    let jumlahUser = array.length;
    for(let a=0;a<jumlahUser;a++){
        if(array[a]["number"] == nomor){
            array[a]["admin"] = true;
            json = JSON.stringify(array);
            await fs.writeFileSync("./database/user.json",json,"utf-8");
            return true
        }
    }
    return false
    //OK
}

const setNoAdmin = async(nomor) => {
    let json = await fs.readFileSync("./database/user.json","utf-8");
    let array = JSON.parse(json);
    let jumlahUser = array.length;
    for(let a=0;a<jumlahUser;a++){
        if(array[a]["number"] == nomor){
            array[a]["admin"] = false;
            json = JSON.stringify(array);
            await fs.writeFileSync("./database/user.json",json,"utf-8");
            return true
        }
    }
    return false
    //OK
}

const setOwner = async(nomor) => {
    let json = await fs.readFileSync("./database/user.json","utf-8");
    let array = JSON.parse(json);
    let jumlahUser = array.length;
    for(let a=0;a<jumlahUser;a++){
        if(array[a]["number"] == nomor){
            array[a]["owner"] = true;
            json = JSON.stringify(array);
            await fs.writeFileSync("./database/user.json",json,"utf-8");
            return true
        }
    }
    return false
    //OK
}

const setNoOwner = async(nomor) => {
    let json = await fs.readFileSync("./database/user.json","utf-8");
    let array = JSON.parse(json);
    let jumlahUser = array.length;
    for(let a=0;a<jumlahUser;a++){
        if(array[a]["number"] == nomor){
            array[a]["owner"] = false;
            json = JSON.stringify(array);
            await fs.writeFileSync("./database/user.json",json,"utf-8");
            return true
        }
    }
    return false
    //OK
}

const getNumberOfUser = async() => {
    let json = await fs.readFileSync("./database/user.json","utf-8");
    let array = JSON.parse(json);
    return array.length
}

const getUserList = async() => {
    let json = await fs.readFileSync("./database/user.json","utf-8");
    let array = JSON.parse(json);
    //let jumlahUser = array.length;
    //let ret = "";
    //for(let a=0;a<jumlahUser;a++){
    //    ret = ret + (a+1)+". "+array[a]['number']+" - "+array[a]["name"]+"\n";
    //}
    //return ret;
    return array;
}


//BLOCKED USER MANAGE FUNCTION

const deleteExpiredBlockedUser = async(number) => {
    let json = await fs.readFileSync("./database/blocked_user.json","utf-8");
    let array = JSON.parse(json);
    let jumlah = array.length;
    let found = false;
    for(let a=0;a<jumlah;a++){
        if(array[a]["number"] == number){
            if(array[a]["block_until"] < timestamp()){
                //Delete Function
                const del = await deleteBlockedUser(number);
                return del;
            }
        }
    }
    return false;
    //OK
}

const checkBlockedUser = async(number) => {
    await deleteExpiredBlockedUser(number);
    let json = await fs.readFileSync("./database/blocked_user.json","utf-8");
    let array = JSON.parse(json);
    let jumlah = array.length;
    let found = false;
    for(let a=0;a<jumlah;a++){
        if(array[a]["number"] == number){
            found = array[a];
        }
    }
    return found;
    //OK
}

const getUserBlockRemaining = async(number) => {
    const nowTime = timestamp();
    const blockedUser = await checkBlockedUser(number);
    if(blockedUser != false){
        const remainingTime = blockedUser.block_until-nowTime;
        const jam = Math.floor(remainingTime / 3600);
        const menit = Math.floor((remainingTime % 3600) / 60);
        const detik = Math.floor(remainingTime % 60);
        return jam+" Jam, "+menit+" Menit, "+detik+" Detik";
    }else{
        return false;
    }
    //OK
}

const addNewBlockedUser = async(number, block_duration, block_reason, block_by) => {
    const checkData = await checkBlockedUser(number);
    if(checkData == false){
        const block_until = timestamp()+block_duration;
        const template = {"number":number,"block_until":block_until,"block_reason":block_reason,"block_by":block_by}
        let json = await fs.readFileSync("./database/blocked_user.json","utf-8");
        let array = JSON.parse(json);
        array.push(template);
        json = JSON.stringify(array);
        await fs.writeFileSync("./database/blocked_user.json",json,"utf-8");
        return true;
    }else{
        return false
    }
    //OK
}

const deleteBlockedUser = async(number) => {
    let json = await fs.readFileSync("./database/blocked_user.json","utf-8");
    let array = JSON.parse(json);
    let jumlahUser = array.length;
    for(let a=0;a<jumlahUser;a++){
        if(array[a]["number"] == number){
            array.splice(a, 1);
            json = JSON.stringify(array);
            await fs.writeFileSync("./database/blocked_user.json",json,"utf-8");
            return true
        }
    }
    return false
    //OK
}



//GROUP MANAGE FUNCTION

const checkGroupRegister = async(groupId) => {
    let json = await fs.readFileSync("./database/group.json","utf-8");
    let array = JSON.parse(json);
    let jumlah = array.length;
    let found = false;
    for(let a=0;a<jumlah;a++){
        if(array[a]["id"] == groupId){
            found = array[a];
        }
    }
    return found;
    //OK
}

const addGroup = async(id,name,regby) => {
    const checkData = await checkGroupRegister(id);
    if(checkData == false){
        const template = {"id":id,"name":name,"badword_protect":true,"register_time":timestamp(),"register_by":regby}
        let json = await fs.readFileSync("./database/group.json","utf-8");
        let array = JSON.parse(json);
        array.push(template);
        json = JSON.stringify(array);
        await fs.writeFileSync("./database/group.json",json,"utf-8");
        return true;
    }else{
        return false
    }
    //OK
}

const deleteGroup = async(id) => {
    let json = await fs.readFileSync("./database/group.json","utf-8");
    let array = JSON.parse(json);
    let jumlah = array.length;
    for(let a=0;a<jumlah;a++){
        if(array[a]["id"] == id){
            array.splice(a, 1);
            json = JSON.stringify(array);
            await fs.writeFileSync("./database/group.json",json,"utf-8");
            return true
        }
    }
    return false
    //OK
}



//BLOCKED GROUP MANAGE FUNCTION

const deleteExpiredBlockedGroup = async(id) => {
    let json = await fs.readFileSync("./database/blocked_group.json","utf-8");
    let array = JSON.parse(json);
    let jumlah = array.length;
    let found = false;
    for(let a=0;a<jumlah;a++){
        if(array[a]["id"] == id){
            if(array[a]["block_until"] < timestamp()){
                //Delete Function
                const del = await deleteBlockedGroup(id);
                return del;
            }
        }
    }
    return false;
    //OK
}

const checkBlockedGroup = async(id) => {
    await deleteExpiredBlockedGroup(id);
    let json = await fs.readFileSync("./database/blocked_group.json","utf-8");
    let array = JSON.parse(json);
    let jumlah = array.length;
    let found = false;
    for(let a=0;a<jumlah;a++){
        if(array[a]["id"] == id){
            found = array[a];
        }
    }
    return found;
    //OK
}

const getGroupBlockRemaining = async(id) => {
    const nowTime = timestamp();
    const blockedUser = await checkBlockedGroup(id);
    if(blockedUser != false){
        const remainingTime = blockedUser.block_until-nowTime;
        const jam = Math.floor(remainingTime / 3600);
        const menit = Math.floor((remainingTime % 3600) / 60);
        const detik = Math.floor(remainingTime % 60);
        return jam+" Jam, "+menit+" Menit, "+detik+" Detik";
    }else{
        return false;
    }
    //OK
}

const addNewBlockedGroup = async(id, block_until, block_reason, block_by) => {
    const checkData = await checkBlockedUser(id);
    if(checkData == false){
        const template = {"id":id,"block_until":block_until,"block_reason":block_reason,"block_by":block_by}
        let json = await fs.readFileSync("./database/blocked_group.json","utf-8");
        let array = JSON.parse(json);
        array.push(template);
        json = JSON.stringify(array);
        await fs.writeFileSync("./database/blocked_group.json",json,"utf-8");
        return true;
    }else{
        return false
    }
    //OK
}

const deleteBlockedGroup = async(id) => {
    let json = await fs.readFileSync("./database/blocked_group.json","utf-8");
    let array = JSON.parse(json);
    let jumlahUser = array.length;
    for(let a=0;a<jumlahUser;a++){
        if(array[a]["id"] == id){
            array.splice(a, 1);
            json = JSON.stringify(array);
            await fs.writeFileSync("./database/blocked_group.json",json,"utf-8");
            return true
        }
    }
    return false
    //
}

const getNumberOfGroup = async() => {
    let json = await fs.readFileSync("./database/group.json","utf-8");
    let array = JSON.parse(json);
    return array.length
}


const addSystemLog = async(data) => {
    const date = new Date();
    const logTimeFormat = date.getDate()+"/"+date.getMonth()+"/"+date.getFullYear()+" : "+date.getHours()+"/"+date.getMinutes()+"/"+date.getSeconds();
    const formattedData = {"time":logTimeFormat,"data":data}
    let json = await fs.readFileSync("./database/log.json","utf-8");
    let array = JSON.parse(json);
    array.push(formattedData);
    json = JSON.stringify(array);
    await fs.writeFileSync("./database/log.json",json,"utf-8");
    console.log("log - "+logTimeFormat+" - "+data)
    return true
}

const flushSystemLog = async() => {
    json = JSON.stringify([]);
    await fs.writeFileSync("./database/log.json",json,"utf-8");
    return true
}

//MENU INFO

const getMenuInfo = async() => {
    let data = await fs.readFileSync("./database/menuinfo.txt","utf-8");
    if(data == ""){
        return false
    }else{
        return data
    }
}

const updateMenuInfo = async(data) => {
    await fs.writeFileSync("./database/menuinfo.txt",data,"utf-8");
    return true
}

const deleteMenuInfo = async() => {
    const data = "";
    await fs.writeFileSync("./database/menuinfo.txt",data,"utf-8");
    return true
}



///EXPORT

module.exports = {checkUserAvailable, addNewUser, deleteUser, setRank, setbronze, setsilver, setgold, changeName, addPoint, cutPoint, addHit, cutHit, addLog, setAdmin, setNoAdmin, setOwner, setNoOwner, getNumberOfUser, getUserList,    checkGroupRegister, addGroup, deleteGroup, getNumberOfGroup,   checkBlockedUser, addNewBlockedUser, deleteBlockedUser, getUserBlockRemaining,   checkBlockedGroup, addNewBlockedGroup, deleteBlockedGroup, getGroupBlockRemaining,   addSystemLog, flushSystemLog,   getMenuInfo, updateMenuInfo, deleteMenuInfo }