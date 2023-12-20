/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { chromium } from "playwright";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { randomUUID } from "crypto";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

const app = initializeApp();
const db = getFirestore(app);
const bucket = getStorage(app).bucket();

export const scrapeSuumo = onRequest(
  { timeoutSeconds: 100, memory: "1GiB" },
  async (request, response) => {
    const targetUrl = request.body.data.targetUrl;

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
    const images = await Promise.all(
      imgUrls.map(async (imgUrl) => {
        const response = await fetch(imgUrl as string);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = response.headers.get("Content-Type");

        return {
          buffer,
          contentType,
        };
      })
    );

    await browser.close();

    const docId = db.collection("rental_houses").doc().id;

    const publicUrls = await Promise.all(
      images.map(async (img) => {
        const imgId = randomUUID();
        const extension = img.contentType?.replace("image/", "");
        const path = `${docId}/${imgId}.${extension}`;
        const file = bucket.file(path);
        const publicUrl = file.publicUrl();

        await bucket.file(path).save(img.buffer);

        return publicUrl;
      })
    );

    const data = {
      title,
      publicUrls,
    };
    await db.collection("rental_houses").doc(docId).set(data);

    response.send({ data });
  }
);
