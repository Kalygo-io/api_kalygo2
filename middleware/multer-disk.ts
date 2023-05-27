import multer from "multer";

// const uploadToServerMiddleware = multer({ dest: "uploads/" });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("destination");

    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    console.log("filename");

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

export const uploadToDiskMiddleware = multer({ storage: storage });
