const axios = require("axios");

const chatgptv1 = async(query) => {
    try {
        const jsonData = await axios.get("https://api.akuari.my.id/ai/gpt?chat="+query);
        const res = jsonData.data.respon;
        return res
    } catch (error) {
        return false
    }
}

const chatgptv2 = async(query) => {
    try {
        const jsonData = await axios.get("https://api.akuari.my.id/ai/gpt-v3?chat="+query);
        const res = jsonData.data.respon;
        return res
    } catch (error) {
        return false
    }
}

const chatgpt = async(query) => {
    const gpt1 = await chatgptv1(query);
    if(gpt1 != false){
        return gpt1;
    }else{
        const gpt2 = await chatgptv2(query);
        return gpt2
    }
}

const bard = async(query) => {
    try {
        const jsonData = await axios.get("https://api.akuari.my.id/ai/gbard?chat="+query);
        const res = jsonData.data.respon;
        return res
    } catch (error) {
        return false
    }
}

module.exports = {chatgpt, bard}