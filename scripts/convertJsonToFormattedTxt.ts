import "dotenv/config";
import fs from "fs";

import db from "database.json";

async function main() {
  console.log("--- ___ ---");
  console.log("JSON", db);

  let dbAsFormattedText = "";
  for (let i = 0; i < 10; i++) {
    console.log("db.data", db.data[i]);
    console.log("i", i);

    dbAsFormattedText += `Infomation for ${db.data[i].name} found below:
First name: ${db.data[i].first_name}
Last name: ${db.data[i].last_name}
Data of birth: ${db.data[i].date_of_birth}
Primary email address: ${db.data[i].primary_email_address}
Primary phone number: ${db.data[i].primary_phone_number}
${db.data[i].company ? `Company: ${db.data[i].company?.name}\n` : ``}\n\n`;
  }

  fs.writeFileSync("./processedDb.txt", dbAsFormattedText);
}

main();
