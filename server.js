require("dotenv").config();
const express = require("express");
const dbConnect = require("./dbConnect");
const userRoute = require("./routes/userRoutes");

const ResumeParser = require("./resume-parser-master/src");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const College = require("./models/colleges");
const resumeData = require("./models/resume");

const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const morgan = require("morgan");
const { morganStream } = require("./morganLogger");

const app = express();
const port = process.env.PORT || 5000;

/* -------------------- DATABASE -------------------- */
dbConnect();

/* -------------------- LOGGING -------------------- */
app.use(morgan("combined", { stream: morganStream }));

/* -------------------- SECURITY MIDDLEWARE -------------------- */
const allowedOrigins = ["http://localhost:3000","https://YOUR-VERCEL-APP.vercel.app"];

app.use(
  helmet({
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    noSniff: true,
  })
);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy violation"));
      }
    },
    credentials: true,
  })
);

app.use(mongoSanitize());
app.use(cookieParser());

/* -------------------- BODY PARSERS -------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------- ROUTES -------------------- */
app.use("/api/user", userRoute);

/* -------------------- MULTER CONFIG -------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./resume-parser-master/resumeFiles/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

/* -------------------- RESUME UPLOAD & PARSE -------------------- */
app.post("/upload", upload.single("File"), (req, res) => {
  ResumeParser.parseResumeFile(
    `./resume-parser-master/resumeFiles/${req.file.filename}`,
    `./resume-parser-master/resumeFiles/compiled`
  )
    .then(() => {
      const resumeJson = fs.readFileSync(
        `./resume-parser-master/resumeFiles/compiled/${req.file.filename}.json`
      );

      const resume = JSON.parse(resumeJson);

      const resumeFile = new resumeData({
        name: resume.name || "",
        email: resume.email || "",
        phone: resume.phone || "",
        skills: resume.skills || "",
        experience: resume.experience || "",
        education: resume.education || "",
        projects: resume.projects || "",
        interests: resume.interests || "",
        certification: resume.certification || "",
        objective: resume.objective || "",
        summary: resume.summary || "",
        technology: resume.technology || "",
        languages: resume.languages || "",
        links: resume.links || "",
        contacts: resume.contacts || "",
        positions: resume.positions || "",
        profiles: resume.profiles || "",
        awards: resume.awards || "",
        honors: resume.honors || "",
        additional: resume.additional || "",
        courses: resume.courses || "",
      });

      return resumeFile.save();
    })
    .then(() => {
      res.json({
        success: true,
        message: "Resume uploaded and parsed successfully",
      });
    })
    .catch((error) => {
      console.error("Resume parsing failed:", error);
      res.status(500).json({ success: false, message: "Parsing failed" });
    });
});

/* -------------------- RESULT API -------------------- */
app.get("/result", async (req, res) => {
  try {
    const latestResume = await resumeData.findOne().sort({ createdAt: -1 });
    if (!latestResume) {
      return res.status(404).json({ message: "No resume found" });
    }
    res.json(latestResume);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------- COLLEGES API -------------------- */
app.get("/colleges", async (req, res) => {
  try {
    const colleges = await College.find({}, { _id: 0, name: 1 }).sort({
      name: 1,
    });
    res.json(colleges);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------- SERVER START -------------------- */
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
