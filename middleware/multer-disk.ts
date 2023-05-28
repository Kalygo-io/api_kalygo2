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

export const uploadToDiskMiddleware = multer({
  storage: storage,
  limits: { fileSize: 1048576 },
});

// 1 MB is 1,048,576 Bytes
// 1 KB is 1,024 Bytes

// .25 MB is 262,144 Bytes
// .25 KB is 256 Bytes
