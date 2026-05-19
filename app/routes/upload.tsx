import { prepareInstructions } from "constants";
import React, { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import FileUploader from "~/components/FileUploader";
import Navbar from "~/components/Navbar";
import { convertPdfToImage } from "~/lib/pdfToImage";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";

const upload = () => {
  const { auth, isLoading, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) navigate("/auth?next=/upload");
  }, [auth.isAuthenticated, isLoading]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [statusText, setstatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    setIsProcessing(true);
    setHasError(false);

    try {
      setstatusText("Uploading your resume...");
      const uploadedFile = await fs.upload([file]);
      if (!uploadedFile) throw new Error("Failed to upload file");

      setstatusText("Converting to image...");
      const imageFile = await convertPdfToImage(file);
      if (!imageFile.file)
        throw new Error(imageFile.error || "Failed to convert pdf to image");

      setstatusText("Uploading the image...");
      const uploadedImage = await fs.upload([imageFile.file]);
      if (!uploadedImage) throw new Error("Failed to upload image");

      setstatusText("Preparing Data...");
      const uuid = generateUUID();
      const data = {
        id: uuid,
        resumePath: uploadedFile.path,
        imagePath: uploadedImage.path,
        companyName,
        jobTitle,
        jobDescription,
        feedback: "",
      };
      await kv.set(`resume:${uuid}`, JSON.stringify(data));
      setstatusText("Analyzing your resume...");

      const feedback = await ai.feedback(
        uploadedImage.path,
        prepareInstructions({ jobDescription, jobTitle }),
      );
      if (!feedback) throw new Error("Failed to analyze resume");

      // Safely extract the feedback text from the AI response
      let feedbackText: string;
      if (typeof feedback.message.content === "string") {
        feedbackText = feedback.message.content;
      } else if (
        Array.isArray(feedback.message.content) &&
        feedback.message.content.length > 0
      ) {
        const firstItem = feedback.message.content[0];
        feedbackText =
          typeof firstItem === "string"
            ? firstItem
            : firstItem?.text || JSON.stringify(firstItem);
      } else {
        throw new Error("Unexpected AI response format");
      }

      data.feedback = JSON.parse(feedbackText);
      await kv.set(`resume:${uuid}`, JSON.stringify(data));
      setstatusText("Resume Analyzed");
      navigate(`/resume/${uuid}`);
    } catch (err) {
      console.error("Resume analysis error:", err);
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setstatusText(message);
      setHasError(true);
    }
  };

  const handleRetry = () => {
    setIsProcessing(false);
    setHasError(false);
    setstatusText("");
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");
    if (!form) return;
    const formData = new FormData(form);
    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;

    if (!file) return;
    handleAnalyze({
      companyName,
      jobTitle,
      jobDescription,
      file,
    });
  };
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Smart feedback for your Resume</h1>
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img src="/images/resume-scan.gif" className="w-full" />
              {hasError && (
                <button
                  className="primary-button mt-6"
                  onClick={handleRetry}
                >
                  Try Again
                </button>
              )}
            </>
          ) : (
            <h2>Drop your Resume for ATS score and improvement tips </h2>
          )}
          {!isProcessing && (
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 mt-8"
            >
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input
                  type="text"
                  name="company-name"
                  id="company-name"
                  placeholder="Company Name"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input
                  type="text"
                  name="job-title"
                  id="job-title"
                  placeholder="Job Title"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <input
                  type="text"
                  name="job-description"
                  id="job-description"
                  placeholder="Job Description"
                />
              </div>
              <div className="form-div">
                <label htmlFor="uploader">Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>
              <button className="primary-button" type="submit">
                Analyze Resume
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};

export default upload;
