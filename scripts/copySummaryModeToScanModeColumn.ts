import "dotenv/config";
import prisma from "@/db/prisma_client";

async function main() {
  // const email = "test@test.com";
  const email = "tad@cmdlabs.io";

  const summaryV3s = await prisma.summaryV3.findMany({});

  console.log("summaryV3s", summaryV3s.length);

  for (let i = 0; i < summaryV3s.length; i++) {
    console.log("--- --- ---");
    console.log("summaryV3s[i]", summaryV3s[i].id);
    // console.log("summaryV3s[i]", summaryV3s[i].mode);
    console.log("summaryV3s[i]", summaryV3s[i].scanMode);

    //     if (summaryV3s[i].mode !== "PRIOR_TO_TRACKING_MODE") {
    //       await prisma.summaryV3.update({
    //         where: {
    //           id: summaryV3s[i].id,
    //         },
    //         data: {
    //           scanMode: summaryV3s[i].mode,
    //         },
    //       });
    //     }
  }
}

main();
