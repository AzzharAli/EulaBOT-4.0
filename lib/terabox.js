import fetch from 'node-fetch';
const {path} = require("path")
const fs = require("fs")
const {randUserAgent} = require("rand-user-agent")

const getInfoRecursive = async (shortUrl, dir = '', root = 0, cookie) => {
  try {
    const queryString = new URLSearchParams({
      app_id: '250528',
      shorturl: shortUrl.slice(1),
      root,
      dir,
    }).toString();
    const r = await fetch(`https://www.terabox.com/share/list?${queryString}`, {
      method: 'GET',
      headers: {
        Cookie: cookie,
      },
    });
    const data = await r.json();
    const childrenPromises = data.list.map(async (e) => ({
      category: e.category,
      fs_id: e.fs_id,
      is_dir: e.isdir,
      size: e.size,
      filename: e.server_filename,
      create_time: e.server_ctime,
      children: e.isdir
        ? await getInfoRecursive(shortUrl, e.path, '0', cookie)
        : undefined,
    }));
    const children = await Promise.all(childrenPromises);
    return children;
  } catch (error) {
    console.log(`Error when get Info Recursive : ${error}`);
  }
};

const getAllInfo = async (url, pwd) => {
  try {
    console.log(`Extracting info from url`);
    const trimmedUrl = url.trimEnd('/');
    const shortUrl = trimmedUrl.split('/').pop();
    let cookie = '';
    if (pwd) {
      cookie = await getCookie(shortUrl, pwd);
    }
    const queryString = new URLSearchParams({
      app_id: '250528',
      shorturl: shortUrl,
      root: '1',
    }).toString();
    const req = await fetch(
      `https://www.terabox.com/api/shorturlinfo?${queryString}`,
      {
        method: 'GET',
        headers: {
          Cookie: cookie,
        },
      }
    );
    const data = await req.json();
    if (data.errno != 0) throw new Error('Failed to get Data');
    const listPromises = data.list.map(async (e) => ({
      category: e.category,
      fs_id: e.fs_id,
      is_dir: e.isdir,
      size: e.size,
      filename: e.server_filename,
      create_time: e.server_ctime,
      children: e.isdir
        ? await getInfoRecursive(shortUrl, e.path, '0', cookie)
        : null,
    }));
    const list = await Promise.all(listPromises);
    const final = {
      ok: true,
      shareid: data.shareid,
      uk: data.uk,
      sign: data.sign,
      timestamp: data.timestamp,
      list: list,
    };
    console.log('\nsuccess get all info\n');
    return final;
  } catch (error) {
    console.log(`Error when getInfo : ${error}`);
  }
};
const getCookie = async (shortUrl, pwd) => {
  try {
    const queryString = new URLSearchParams({
      app_id: '250528',
      surl: shortUrl.slice(1),
    }).toString();
    const res = await fetch(
      'https://www.terabox.com/share/verify?' + queryString,
      {
        method: 'POST',
        body: new URLSearchParams({ pwd }),
      }
    );
    const response = await res.json();
    if (response.errno != 0) throw new Error('Wrong password');
    return res.headers['set-cookie']?.split(' ')[0] || '';
  } catch (error) {
    console.log(`ERROR WHEN GET COOKIE : ${error}`);
  }
};

const processItemRecursively = (item, currentPath = '') => {
    const results = [];
  
    try {
      const fullPath = path.join(currentPath, item.filename);
  
      if (item.is_dir === '1' || item.is_dir === 1) {
        if (item.children && item.children.length > 0) {
          item.children.forEach((child) => {
            results.push(
              ...processItemRecursively(
                child,
                // Perbaikan disini, gunakan fullPath sebagai currentPath
                fullPath
              )
            );
          });
        }
      } else {
        // Perubahan: hapus properti 'children' dari item sebelum ditambahkan ke results
        const { children, ...itemWithoutChildren } = item;
        const fileObject = {
          ...itemWithoutChildren,
          path: fullPath,
        };
        results.push(fileObject);
      }
    } catch (error) {
      console.error(`Error processing item: ${error.message}`);
    }
  
    return results;
  };


const ruserAgent = () => {
  try { 
    return randUserAgent('desktop', 'mozilla', 'linux');
  } catch (error) {
    return new Error(`error when generating useragent : ${error}`);
  }
};

const userAgent = ruserAgent();

const getDlink = async (
  shareid,
  uk,
  sign,
  timestamp,
  fs_id,
  cookie,
  jsToken,
  dpLogid
) => {
  try {
    const queryString = new URLSearchParams({
      app_id: '250528',
      web: '1',
      channel: 'dubox',
      clienttype: '0',
      jsToken: jsToken,
      'dp-logid': dpLogid,
      shareid,
      uk,
      sign,
      timestamp,
      primaryid: shareid,
      product: 'share',
      nozip: '0',
      fid_list: `[${fs_id}]`,
    }).toString();
    const url = `https://www.terabox.com/share/download?${queryString}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Cookie: cookie,
      },
    });
    const data = await res.json();
    if (data.errno !== 0) {
      throw {
        ...data,
      };
    }

    return {
      ok: true,
      dlink: data.dlink,
    };
  } catch (error) {
    return {
      ok: false,
      errno: error.errno,
      errmsg: error.errmsg,
      request_id: error.request_id,
    };
  }
};
const getUrlDownload = async (dlink, userAgent, cookie) => {
  try {
    const response = await fetch(dlink, {
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
        'sec-ch-ua':
          '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
        'Accept-Language': 'en-US,en;q=0.5',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        Cookie: cookie,
      },
    });
    if (!response.redirected) throw new Error('Failed get url download');
    return {
      ok: true,
      downloadLink: response.url,
    };
  } catch (error) {
    console.log(error);
  }
};

const getDownloadUrl = async (shareId, uk, sign, timestamp, fs_id) => {
  try {
    const jsToken =
      '311B9DA4E42D07A8CD4A8C1489CB7849E9AE8765B6F5CFBDF5D86A59C286708570566B58111DCB41458FD37DED09B6B9B19C477CA78865FCA7D024442C760DE5A366AB6D92B580093D28FDFB8BBA9A1F0DC814A3FB3DCB0966F54BE3B6AF49C3';
    const dplogid = '8916216141031424108';
    const cookies =
      'browserid=NUpyZednrjSz4n9nOQS4rn6fcT4Lqt2uoFlGyUoOtbr7W-iqyiPzrYz_-mM=; lang=en; TSID=oQg7kd3VUrBgaNlVyjK694xf8oJwng2A; __bid_n=18c0fc12089e2988634207; _ga=GA1.1.1709727695.1701156049; csrfToken=NZxIO5Afv_sfY1iEIKtK0RNH; ndut_fmt=79CA4094BA5B53E2A105EEBB4A431A6FB971B97629322B9B28C56D382B7EBF46; _ga_06ZNKL8C2E=GS1.1.1701422746.6.1.1701422771.35.0.0';
    const res = await getDlink(
      shareId,
      uk,
      sign,
      timestamp,
      fs_id,
      cookies,
      jsToken,
      dplogid
    );
    if (res.ok == true) {
      const { dlink } = res;
      const data = await getUrlDownload(dlink, userAgent, cookies);
      return data;
    } else {
      throw res;
    }
  } catch (error) {
    return error;
  }
};

  module.exports = {processItemRecursively, getAllInfo, getDownloadUrl}