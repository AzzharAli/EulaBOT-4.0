const cheerio = require("cheerio");
const axios = require("axios");
const request = require("request")


const shareToView = (url) => {
    const id = url.split("/")['5'];
    const viewLink = "https://drive.google.com/uc?export=download&id="+id
    return(viewLink)
}

const genshinwaifu = async() => {
    try {
        const jsonData = await axios.get("http://resource.eula.my.id/genshinwaifu.json")
        const allData = jsonData.data;
        const jumlahData = allData.length;
        const random = Math.floor(Math.random() * jumlahData);
        const link = shareToView(allData[random]);
        return link
    } catch (error) {
        return false
    }
}
const hsrwaifu = async() => {
    try {
        const jsonData = await axios.get("http://resource.eula.my.id/hsrwaifu.json")
        const allData = jsonData.data;
        const jumlahData = allData.length;
        const random = Math.floor(Math.random() * jumlahData);
        const link = shareToView(allData[random]);
        return link;
    } catch (error) {
        return false
    }
}

const randomWaifuSfw = async() => {
    try {
        const jsonData = await axios.get("https://api.waifu.pics/sfw/waifu")
        const link = jsonData.data.url;
        return(link)
    } catch (error) {
        return false
    }
}

const randomWaifuNsfw = async() => {
    try {
        const jsonData = await axios.get("https://api.waifu.pics/nsfw/waifu")
        const link = jsonData.data.url;
        return(link)
    } catch (error) {
        return false
    }
}

module.exports = {genshinwaifu, hsrwaifu, randomWaifuSfw, randomWaifuNsfw}