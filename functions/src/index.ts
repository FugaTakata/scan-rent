/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {chromium} from "playwright";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});


export const scrapeSuumo = onRequest(
  {timeoutSeconds: 100, memory: "1GiB"},
  async (request, response) => {
    // const targetUrl = "SUUMOの賃貸物件の情報が載ったページのURL";
    const targetUrl =
      "https://suumo.jp/chintai/jnc_000085234830/?bc=100349846901";

    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto(targetUrl);

    // 物件タイトルの取得
    const title = await page
      .locator("#wrapper > div.section_h1 > div.section_h1-header > h1")
      .textContent();

    // 写真の取得
    const imgUrls = await Promise.all(
      (
        await page.locator("#js-view_gallery-list li a img").all()
      ).map((img) => img.getAttribute("src"))
    );
    const imgs = await Promise.all(
      imgUrls.map(async (imgUrl) => {
        const response = await fetch(imgUrl as string);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = response.headers.get("Content-Type");
        const base64 = `data:${contentType};base64,${buffer.toString(
          "base64"
        )}`;

        return base64;
      })
    );

    await browser.close();

    logger.info(title, {structuredData: true});
    logger.info(imgs, {structuredData: true});
    response.send(title);
  }
);
