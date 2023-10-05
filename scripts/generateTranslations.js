const fs = require("fs");
const get = require("lodash.get");
const { Translate } = require("@google-cloud/translate").v2;
const sourceFolderPath = "locales/en";
const outputPath = "locales";

// personal credentials, update before pushing to production
const projectId = "kalygotranslation2";
const keyFilename = "keyfile.json";
const targetLanguages = ["en", "es", "pt", "fr"];

const translate = new Translate({ projectId, keyFilename });

// function to translate values in files
async function translateJSONValues(file, val, targetLanguage, path) {
  console.log("translateJSONValues");

  if (typeof val === "string") {
    console.log("path", path);

    let snapshotJSON;
    if (fs.existsSync(`${sourceFolderPath}/${file}.snapshot`)) {
      snapshotJSON = JSON.parse(
        fs.readFileSync(`${sourceFolderPath}/${file}.snapshot`, "utf8")
      );
    }

    const oldValue = get(snapshotJSON, path);
    const newValue = val;

    console.log("oldValue", snapshotJSON, oldValue, path);
    console.log("newValue", val, newValue, path);

    if (oldValue !== newValue) {
      console.log("HERE");

      const variables = [];
      const translatedValue = newValue.replace(
        /{{\w+}}/g,
        (match, variable) => {
          variables.push(variable);
          return variables.length - 1;
        }
      );

      const [translation] = await translate.translate(
        translatedValue,
        targetLanguage
      );

      const translatedResult = translation.replace(/(\d+)/g, (match, index) => {
        return `{{${variables[parseInt(index)]}}}`;
      });

      return translatedResult;
    } else {
      if (fs.existsSync(`${outputPath}/${targetLanguage}/${file}`)) {
        const oldTranslatedFile = JSON.parse(
          fs.readFileSync(`${outputPath}/${targetLanguage}/${file}`, "utf8")
        );
        return get(oldTranslatedFile, path);
      } else {
        const [translation] = await translate.translate(val, targetLanguage);
        return translation;
      }
    }
  } else if (Array.isArray(val)) {
    const translatedArray = [];
    for (const key in val) {
      console.log("key", key);

      const translatedItem = await translateJSONValues(
        file,
        val[key],
        targetLanguage,
        `${path}.${key}`
      );
      translatedArray.push(translatedItem);
    }
    return translatedArray;
  } else if (typeof val === "object") {
    const translatedObject = {};
    for (const key in val) {
      if (val.hasOwnProperty(key)) {
        const value = val[key];
        const translatedValue = await translateJSONValues(
          file,
          value,
          targetLanguage,
          path ? `${path}.${key}` : `${key}`
        );
        translatedObject[key] = translatedValue;
      }
    }
    return translatedObject;
  } else {
    return val;
  }
}

async function createFiles(targetLanguage) {
  try {
    const files = fs.readdirSync(sourceFolderPath);
    for (const file of files) {
      if (file.endsWith(".json")) {
        const inputFilePath = `${sourceFolderPath}/${file}`;
        const outputFolderPath = `${outputPath}/${targetLanguage}`;
        if (!fs.existsSync(outputFolderPath)) {
          fs.mkdirSync(outputFolderPath, { recursive: true });
        }
        const outputFilePath = `${outputFolderPath}/${file}`;
        const inputJSON = JSON.parse(fs.readFileSync(inputFilePath, "utf8"));
        const translatedJSON = await translateJSONValues(
          file,
          inputJSON,
          targetLanguage,
          ""
        );

        console.log("*** translatedJSON ***", translatedJSON);

        // save snapshot
        fs.writeFileSync(
          `${sourceFolderPath}/${file}.snapshot`,
          JSON.stringify(inputJSON, null, 2),
          "utf8"
        );

        fs.writeFileSync(
          outputFilePath,
          JSON.stringify(translatedJSON, null, 2),
          "utf8"
        );
        console.log(`Translated ${file} to ${targetLanguage}`);
      }

      // break;
    }
  } catch (error) {
    console.error(`Error reading source folder: ${error}`);
  }
}

// new function made to handle languages in parallel
async function translateFilesParallel(targetLanguages) {
  // for (let i = 0; i < targetLanguages.length; i++) {
  //   console.log(targetLanguages[i]);
  //   createFiles(targetLanguages[i]);
  // }

  const promises = targetLanguages.map((targetLanguage) =>
    createFiles(targetLanguage)
  );
  await Promise.all(promises);
}

translateFilesParallel(targetLanguages);
