import Constants from "expo-constants";

/* app.json'dagi "version"ni o'qiydi — Play Market/App Store'ga yuklanadigan
   haqiqiy versiya bilan bir xil bo'lishi uchun. Har yangi relizda faqat
   app.json'dagi "version"ni yangilash kifoya, ekranlarda alohida
   o'zgartirish shart emas. */
export const appVersion = Constants.expoConfig?.version || "1.0.0";
