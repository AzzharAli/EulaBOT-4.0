const axios = require ('axios');
const fs = require ('fs');


const searchDaerah = async(daerah) => {
    try {
        let res = await axios.get('https://api.akuari.my.id/islami/jadwalshalat?query='+daerah,
        {
            headers: {
                'Accept-Encoding': 'application/json',  
            }
        });
        if(res.status == 200 && res.data.message != "Ups, error"){
            const jam = res.data.hasil.today;
            return(jam)
        }else{
            return(false)
        }
    } catch (error) {
        return false
    }
}



module.exports = {searchDaerah};