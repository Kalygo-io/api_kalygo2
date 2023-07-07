const fs = require("fs");
const { Translate } = require("@google-cloud/translate").v2;
const sourceFolderPath = "locales/en";
const outputPath = "locales";

// personal credentials, update before pushing to production
const projectId = "kalygotranslation2";
const keyFilename = "keyfile.json";
const targetLanguages = ["en", "es", "pt", "fr"];

const translate = new Translate({ projectId, keyFilename });

// function to translate values in files
async function translateJSONValues(json, targetLanguage) {
  if (typeof json === "string") {
    const [translation] = await translate.translate(json, targetLanguage);
    return translation;
  } else if (Array.isArray(json)) {
    const translatedArray = [];
    for (const item of json) {
      const translatedItem = await translateJSONValues(item, targetLanguage);
      translatedArray.push(translatedItem);
    }
    return translatedArray;
  } else if (typeof json === "object") {
    const translatedObject = {};
    for (const key in json) {
      if (json.hasOwnProperty(key)) {
        const value = json[key];
        const translatedValue = await translateJSONValues(
          value,
          targetLanguage
        );
        translatedObject[key] = translatedValue;
      }
    }
    return translatedObject;
  } else {
    return json;
  }
}

async function createFiles(targetLanguage) {
  try {
    const files = fs.readdirSync(sourceFolderPath);
    for (const file of files) {
      const inputFilePath = `${sourceFolderPath}/${file}`;
      const outputFolderPath = `${outputPath}/${targetLanguage}`;
      if (!fs.existsSync(outputFolderPath)) {
        fs.mkdirSync(outputFolderPath, { recursive: true });
      }
      const outputFilePath = `${outputFolderPath}/${file}`;
      const inputJSON = JSON.parse(fs.readFileSync(inputFilePath, "utf8"));
      const translatedJSON = await translateJSONValues(
        inputJSON,
        targetLanguage
      );
      fs.writeFileSync(
        outputFilePath,
        JSON.stringify(translatedJSON, null, 2),
        "utf8"
      );
      console.log(`Translated ${file} to ${targetLanguage}`);
    }
  } catch (error) {
    console.error(`Error reading source folder: ${error}`);
  }
}

// new function made to handle languages in parallel
async function translateFilesParallel(targetLanguages) {
  const promises = targetLanguages.map((targetLanguage) =>
    createFiles(targetLanguage)
  );
  await Promise.all(promises);
}

translateFilesParallel(targetLanguages);
