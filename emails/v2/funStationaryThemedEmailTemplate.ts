import en_emailsTranslations from "@/locales/en/emails.json";
import es_emailsTranslations from "@/locales/es/emails.json";
import fr_emailsTranslations from "@/locales/fr/emails.json";
import pt_emailsTranslations from "@/locales/pt/emails.json";

const TEMPLATE = `FUN_STATIONARY_THEME`;

export function funStationaryTheme_SES_Config(
  email: string,
  subject: string,
  greeting: string,
  paragraph1: string,
  ending: string,
  language: any
) {
  let translations;
  switch (language) {
    case "en":
      translations = en_emailsTranslations;
      break;
    case "es":
      translations = es_emailsTranslations;
      break;
    case "fr":
      translations = fr_emailsTranslations;
      break;
    case "pt":
      translations = pt_emailsTranslations;
      break;
    default:
      translations = en_emailsTranslations;
  }

  return {
    Destination: {
      CcAddresses: [],
      //   ToAddresses: [
      //     "Tad Duval <tad@cmdlabs.io>",
      //     "Tad Duval <ceemmmdee@gmail.com>",
      //   ],
      ToAddresses: [
        "Ana Caka <ac7601@bard.edu>",
        "Anthony Gomez <joseph.12082@gmail.com>",
        "Lauren Seff <laurenseff@gmail.com>",
        "Matt Hughes <matt@matthughes.link>",
        "Sarah Murphy <sarahmurphy005@icloud.com>",
      ],
      //   ToAddresses: [
      //     "Jesse Hollander <jesse@aiforge.org>",
      //     "Kevin Jackson <kevin@aiforge.org>",
      //     "Miguel Diaz <miguel@aiforge.org>",
      //     "Patrick Thompson <patrick@aiforge.org>",
      //   ],
    },
    Source: "Kalygo <noreply@kalygo.io>",
    Template: TEMPLATE,
    TemplateData: `{
\"SUBJECT"\: \"A hyper-personalized message from Kalygo...\",
\"MESSAGE_AS_TEXT\": \"Dear Team,\\n\\n\I hope this email finds you all well. I wanted to take a moment to express my sincere appreciation for the hard work, dedication, and creativity each one of you brings to Kalygo. Your individual strengths and unique perspectives are what make us a formidable team.\\n\\nSarah, your ability to create engaging content and your marketing skills are invaluable. Your proactive nature, adaptability, and excellent communication skills have not gone unnoticed. Your commitment to excellence and your drive to succeed are truly inspiring. Your passion for problem-solving and your leadership skills are key to our success. Thank you for your unwavering dedication and for always striving to contribute to our team and project.\\n\\nMatt, your dedication and proactive nature are commendable. Your expertise in User Experience & User Interface Design is crucial to our product's success. Your analytical thinking and creativity have been instrumental in our strategic planning. Your passion for improving systems and tools, and your interest in digital solutions are what make you an integral part of our team. Thank you for your commitment and for always seeking ways to enhance the user experience.\\n\\nLauren, your ability to understand user needs and craft thoughtful solutions is truly impressive. Your creativity, analytical thinking, and drive to exceed user expectations are what make our product user-friendly and intuitive. Thank you for your innovative approach and for your dedication to driving positive change in the digital landscape.\\n\\nAnthony, your dedication and hard work are truly admirable. Your technical skills and problem-solving abilities are key to our software development. Your responsibility, discipline, and focus are what make you a reliable team member. Thank you for your commitment to your role and for your passion for teaching and coding.\\n\\nAna, your proactive nature and creativity are truly inspiring. Your attention to detail and willingness to learn are what make you a valuable team member. Your optimism and hard work are contagious and motivate us all. Thank you for your dedication to growth and for your desire to contribute to Kalygo's success.\\n\\nAs we look ahead to the next 2 to 3 weeks, I want to encourage everyone to focus on sales. Let's leverage our individual strengths and work together to achieve our sales targets. I am confident that with our combined efforts, we will exceed our goals. Once again, thank you all for your hard work and dedication. Let's continue to push boundaries, innovate, and make Kalygo a success.\\n\\nBest,\\nTad Duval (Kalygo's CEO)\",
\"EMAIL_PREVIEW_TEXT\": \"A hyper-personalized messaged from Kalygo...\",
\"LOGO_IMAGE_URL\": \"https://kalygo.io/kalygo_new_logo-192x192.png\",
\"LOGO_ONCLICK_URL\": \"https://kalygo.io\",
\"GREETING\":\"Dear Team,\",
\"PARAGRAPH_1\":\"I hope this email finds you all well. I wanted to take a moment to express my sincere appreciation for the hard work, dedication, and creativity each one of you brings to Kalygo. Your individual strengths and unique perspectives are what make us a formidable team.\",
\"PARAGRAPH_2\":\"Sarah, your ability to create engaging content and your marketing skills are invaluable. Your proactive nature, adaptability, and excellent communication skills have not gone unnoticed. Your commitment to excellence and your drive to succeed are truly inspiring. Your passion for problem-solving and your leadership skills are key to our success. Thank you for your unwavering dedication and for always striving to contribute to our team and project.\",
\"PARAGRAPH_3\":\"Matt, your dedication and proactive nature are commendable. Your expertise in User Experience & User Interface Design is crucial to our product's success. Your analytical thinking and creativity have been instrumental in our strategic planning. Your passion for improving systems and tools, and your interest in digital solutions are what make you an integral part of our team. Thank you for your commitment and for always seeking ways to enhance the user experience.\",
\"PARAGRAPH_4\":\"Lauren, your ability to understand user needs and craft thoughtful solutions is truly impressive. Your creativity, analytical thinking, and drive to exceed user expectations are what make our product user-friendly and intuitive. Thank you for your innovative approach and for your dedication to driving positive change in the digital landscape.\",
\"PARAGRAPH_5\":\"Anthony, your dedication and hard work are truly admirable. Your technical skills and problem-solving abilities are key to our software development. Your responsibility, discipline, and focus are what make you a reliable team member. Thank you for your commitment to your role and for your passion for teaching and coding.\",
\"PARAGRAPH_6\":\"Ana, your proactive nature and creativity are truly inspiring. Your attention to detail and willingness to learn are what make you a valuable team member. Your optimism and hard work are contagious and motivate us all. Thank you for your dedication to growth and for your desire to contribute to Kalygo's success.\",
\"PARAGRAPH_7\":\"As we look ahead to the next 2 to 3 weeks, I want to encourage everyone to focus on sales. Let's leverage our individual strengths and work together to achieve our sales targets. I am confident that with our combined efforts, we will exceed our goals. Once again, thank you all for your hard work and dedication. Let's continue to push boundaries, innovate, and make Kalygo a success.\",
\"ENDING\":\"Best,\"
}`,
    ReplyToAddresses: ["support@kalygo.io"],
    ConfigurationSetName: "kalygo_config_set",
    Tags: [
      {
        Name: "BatchId",
        Value: "Kalygo",
      },
    ],
  };
}
