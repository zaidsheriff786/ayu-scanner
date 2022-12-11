import React, { useRef, useState, useCallback, createRef } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import DocumentScannerOutlinedIcon from "@mui/icons-material/DocumentScannerOutlined";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import Divider from "@mui/material/Divider";
import Webcam from "react-webcam";
import axios from "axios";
import "./App.css";

function App() {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [textOcr, setTextOcr] = useState(null);
  const [load, setLoad] = useState(false);
  let fileInputRef = createRef();

  const capture = useCallback(() => {
    setLoad(true);
    const imageSrc = webcamRef.current.getScreenshot();
    let url = "http://localhost:3001/capture";
    let config = {
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Access-Control-Allow-Origin": "*",
      },
    };
    let data = {
      img: imageSrc,
    };
    axios
      .post(url, data, config)
      .then((res) => {
        setTextOcr(res.data.text);
        setImgSrc(imageSrc);
        setLoad(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [webcamRef, setImgSrc]);

  const upload = (file) => {
    setLoad(true);
    var url = "http://localhost:3001/upload";
    var formData = new FormData();
    formData.append("file", file);
    var config = {
      headers: { "Content-Type": "multipart/form-data" },
    };
    return axios.post(url, formData, config).then((res) => {
      setTextOcr(res.data.text);
      setImgSrc(res.data.image);
      setLoad(false);
    });
  };

  return (
    <div className="App">
      <AppBar position="fixed">
        <Toolbar sx={{ alignItems: "center", justifyContent: "center" }}>
          <Typography variant="h5" component="div">
            AYU SCANNER
          </Typography>
          <DocumentScannerOutlinedIcon
            fontSize="large"
            sx={{ marginLeft: "4px" }}
          />
        </Toolbar>
      </AppBar>
      <div style={{ height: "64px" }}></div>
      <div className="root">
        <div style={{ display: "flex", flexDirection: "row", height: "100%" }}>
          <div
            style={{ width: "50%", padding: "16px", flexDirection: "column" }}
          >
            <div style={{ width: "100%" }}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
              />
            </div>
            <div
              style={{
                display: "flex",
                marginTop: "16px",
                justifyContent: "center",
              }}
            >
              <div>
                <Button
                  size="large"
                  variant="outlined"
                  startIcon={<CameraAltIcon />}
                  onClick={capture}
                >
                  Capture
                </Button>
              </div>
              <div style={{ marginLeft: "32px" }}>
                <Button
                  onClick={() => fileInputRef.current.click()}
                  size="large"
                  variant="contained"
                  startIcon={<FileUploadIcon />}
                >
                  Upload
                  <>
                    <form encType="multipart/form-data">
                      <input
                        ref={fileInputRef}
                        type="file"
                        hidden
                        name="filename"
                        onChange={(x) => {
                          upload(x.target.files[0]);
                        }}
                        accept="image/*"
                      />
                    </form>
                  </>
                </Button>
              </div>
            </div>
          </div>
          <Divider
            orientation="vertical"
            variant="middle"
            flexItem
            sx={{ borderWidth: 1 }}
          />
          <div
            style={{
              width: "50%",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {load ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  margin: "auto",
                  alignItems: "center",
                }}
              >
                <CircularProgress />
                <Typography variant="subtitle1" component="h2" color="#1976d2">
                  Loading...
                </Typography>
              </Box>
            ) : imgSrc ? (
              <>
                <Typography variant="h5" component="h3">
                  Result
                </Typography>
                <div style={{ marginTop: "4px", marginBottom: "4px" }}>
                  <img
                    style={{
                      width: "100%",
                      height: "300px",
                      objectFit: "cover",
                      objectPosition: "bottom",
                    }}
                    alt="captured"
                    src={imgSrc}
                  />
                </div>
                <textarea
                  disabled={true}
                  rows="4"
                  cols="100"
                  style={{ width: "100%", height: "100%" }}
                >
                  {textOcr}
                </textarea>
              </>
            ) : (
              <Typography variant="h5" component="h3">
                No data preview
              </Typography>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
