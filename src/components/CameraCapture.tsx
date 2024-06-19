import React, { useRef, useState } from "react";
import axios from "axios";
import { AnalyzeData } from "../types/analyzeData";
import { Conv3D } from "@tensorflow/tfjs";

const CameraCapture: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [analyzeData, setAnalyzeData] = useState<AnalyzeData>();
  const [isLoading, setIsLoading] = useState<boolean>();

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  };

  const captureImage = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      context?.drawImage(videoRef.current, 0, 0, 640, 480);
      canvasRef.current.toBlob(async (blob) => {
        if (blob) {
          const formData = new FormData();
          formData.append("image", blob, "image.png");

          try {
            setIsLoading(true);
            const response = await axios.post(
              "http://localhost:5000/api/analyze",
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              }
            );
            setAnalyzeData(response.data.data as AnalyzeData);
            console.log("Response:", response.data);
            setIsLoading(false);
          } catch (error) {
            console.error("Error:", error);
          } finally {
            setIsLoading(false);
          }
        }
      }, "image/png");
    }
  };

  //   const captureImage = async () => {
  //     if (videoRef.current && canvasRef.current) {
  //       const context = canvasRef.current.getContext("2d");
  //       context?.drawImage(videoRef.current, 0, 0, 640, 480);
  //       const imageData = canvasRef.current.toDataURL("image/png");
  //       try {
  //         const response = await axios.post("http://localhost:5000/api/analyze", {
  //           image: imageData,
  //         });
  //         console.log("Response:", response.data);
  //       } catch (error) {
  //         console.error("Error:", error);
  //       }
  //     }
  //   };
  //   const saveAnalysis = async (data: any) => {
  //     try {
  //       await axios.post("http://localhost:5000/api/save", { data });
  //       console.log("Data saved successfully");
  //     } catch (error) {
  //       console.error("Error saving data:", error);
  //     }
  //   };

  return (
    <div className="mt-20 px-2">
      <div className="flex flex-col gap-2 items-center">
        <h2 className="text-center text-xl text-blue-500 font-medium">
          Image prediction AI
        </h2>
        <p>
          1. Please click to Start camera to start the camera and{" "}
          <span className="font-semibold">give permission</span>{" "}
        </p>
        <p>
          2. When your camera is set click{" "}
          <span className="font-semibold">capture image</span> to predict the
          captured image and result will show below.{" "}
        </p>
      </div>
      <div className="flex items-center flex-col gap-2">
        <video ref={videoRef} autoPlay width="640" height="480"></video>
        <div className="flex gap-3">
          <button
            className="px-3 py-2 rounded-lg text-white bg-blue-500 hover:text-black hover:bg-blue-300"
            onClick={startCamera}
          >
            Start Camera
          </button>
          <button
            className="px-3 py-2 rounded-lg text-white bg-blue-500 hover:text-black hover:bg-blue-300"
            onClick={captureImage}
          >
            Capture Image
          </button>
        </div>
        <canvas
          ref={canvasRef}
          width="640"
          height="640"
          style={{ display: "none" }}
        ></canvas>
      </div>
      <div className="max-w-[600px] mx-auto ">
        {analyzeData && !isLoading ? (
          <div className="flex flex-col items-start">
            <p>
              <span className="font-semibold text-xl">Area: </span>
              <span className="capitalize">{analyzeData.area}</span>
            </p>
            <p>
              <span className="font-semibold text-xl">Tracked Object: </span>
              <span className="capitalize">
                {analyzeData.trackedObjects[0]}
              </span>
            </p>
          </div>
        ) : !analyzeData && !isLoading ? null : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
