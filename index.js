const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const Tesseract = require("tesseract.js");

const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors());
app.use(fileUpload());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
  })
);

app.use(express.static(path.resolve(__dirname, "./public/images/")));
// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, "./build")));

app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./build", "index.html"));
});

const capturedImage = async (req, res, next) => {
  try {
    const targetPath = path.join(__dirname, "./public/images/ocr_image.jpeg");
    let imgdata = req.body.img; // get img as base64
    const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, ""); // convert base64
    fs.writeFileSync(targetPath, base64Data, { encoding: "base64" }); // write img file

    Tesseract.recognize(`${targetPath}`, "eng", {
      logger: (m) => console.log(m),
    }).then(({ data: { text } }) => {
      return res.send({
        image: imgdata,
        text: text,
      });
    });
  } catch (e) {
    console.log("error occured==>");
    next(e);
  }
};
app.post("/capture", capturedImage);

app.post("/upload", (req, res) => {
  if (req.files) {
    let file = req.files.file;
    let fileName = file.name;
    const location = path.join(__dirname, "./public/images/");
    file.mv(location + fileName, (err) => {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        const location = path.join(__dirname, "./public/images/");
        const contents = fs.readFileSync(`${location}/${fileName}`, {
          encoding: "base64",
        });

        Tesseract.recognize(`${location + fileName}`, "eng", {
          logger: (m) => console.log(m),
        })
          .then(({ data: { text } }) => {
            return res.send({
              image: `data:image/jpeg;base64,${contents}`,
              text: text,
            });
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
