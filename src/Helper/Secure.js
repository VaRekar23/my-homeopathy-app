import CryptoJS from "crypto-js";

export const encryptData = (data) => {
    const secretKey = process.env.REACT_APP_SECRET_KEY;
    const cipherText = CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
    return cipherText;
}

export const decryptData = (encryptedData) => {
    const secretKey = process.env.REACT_APP_SECRET_KEY;
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    const decryptData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptData;
}