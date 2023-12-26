const puppeteer = require("puppeteer");
const fs = require("fs");



async function screenshot(link) {

let url;
if(link.includes("https://")){
    url=link;
}else if(link.includes("http://")){
    url = link.replace("http://","https://");
}else{
    url = "http://"+link;
}

  const browser = await puppeteer.launch({
    defaultViewport: {
        width: 1920,
        height: 1080,
      },
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      referer: "https://google.com/q=hentai",
      executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe",
      //args: ['--disable-gpu', '--no-sandbox'],
      headless:true
  });
try {

  // Buka halaman web
  const page = await browser.newPage();
  await page.goto(url);

  if(url.includes("bmkg")){
    await page.setZoom(150);
  }

  await page.waitForTimeout(5000);

  // Ambil screenshot halaman web
  const screenshot = await page.screenshot({
    path: "./temp/webscreenshot.png",
    width: 1920,
    height: 1080
  });

  // Tutup browser
  await browser.close();

  // Kembalikan screenshot
  return screenshot;
} catch (error) {
    await browser.close();
    return false
}
}

module.exports = screenshot;