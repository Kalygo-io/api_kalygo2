import "dotenv/config";
import fs from "fs";
import { faker } from "@faker-js/faker";

async function main() {
  let mockDbText = "";
  for (let i = 0; i < 1000; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    mockDbText += `CONTACT #${i + 1}:
Full name: ${firstName} ${lastName}
First name: ${firstName}
Last name: ${lastName}
Data of birth: ${faker.date.anytime()}
Primary email address: ${faker.internet.email()}
Primary phone number: ${faker.phone.number()}
Company: ${faker.company.name()}\n\n`;
  }

  fs.writeFileSync("./mockedDb.txt", mockDbText);
}

main();
