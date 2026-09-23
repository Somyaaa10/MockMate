const mongoose = require("mongoose");
const Resume = require("../models/resume.model");
const cloudinary = require("../config/cloudinary");
const { PDFParse } = require("pdf-parse");
const aiService = require("./ai.service");
const ApiError = require("../utils/ApiError");

const uploadResume = async ({ userId, file }) => {
  if (!file) {
    throw new ApiError(400, "Resume file is required");
  }

  // 1. Extract text from PDF
  const parser = new PDFParse({
    data: file.buffer,
  });

  const pdfData = await parser.getText();

  const extractedText = pdfData.text.trim();

  await parser.destroy();

  if (!extractedText) {
    throw new ApiError(400, "Could not extract text from resume");
  }

  // 2. Upload PDF to Cloudinary
  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "mockmate/resumes",
        resource_type: "raw",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Error:", error);
          reject(error);
        } else {
          resolve(result);
        }
      },
    );

    stream.end(file.buffer);
  });

  // 3. Save resume in MongoDB
  const resume = await Resume.create({
    user: userId,
    fileName: file.originalname,
    fileUrl: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    extractedText: extractedText,
  });

  return resume;
};

// To get all resume
const getUserResumes = async (userId) => {
  const resumes = await Resume.find({
    user: userId,
  }).sort({
    createdAt: -1,
  });

  return resumes;
};

// To get single resume
const getResumeById = async (resumeId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(resumeId)) {
    throw new ApiError(400, "Invalid resume ID");
  }

  const resume = await Resume.findOne({
    _id: resumeId,
    user: userId,
  });

  if (!resume) {
    throw new ApiError(404, "Resume not found");
  }

  return resume;
};

// To delete resume
const deleteResume = async (resumeId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(resumeId)) {
    throw new ApiError(400, "Invalid resume ID");
  }

  const resume = await Resume.findOne({
    _id: resumeId,
    user: userId,
  });

  if (!resume) {
    throw new ApiError(404, "Resume not found");
  }

  // Delete file from Cloudinary
  await cloudinary.uploader.destroy(resume.publicId, {
    resource_type: "raw",
  });

  // Delete resume from MongoDB
  await Resume.findByIdAndDelete(resumeId);

  return resume;
};

// To analyze the resume
const analyzeResume = async (resumeId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(resumeId)) {
    throw new ApiError(400, "Invalid resume ID");
  }

  const resume = await Resume.findOne({
    _id: resumeId,
    user: userId,
  });

  if (!resume) {
    throw new ApiError(404, "Resume not found");
  }

  if (!resume.extractedText) {
    throw new ApiError(400, "Resume text is not available");
  }

  if (resume.analyzedAt) {
    return resume;
  }

  const analysis = await aiService.analyzeResume(resume.extractedText);

  resume.atsScore = analysis.atsScore;
  resume.candidateName = analysis.candidateName || "";
  resume.candidateEmail = analysis.candidateEmail || "";
  resume.candidatePhone = analysis.candidatePhone || "";
  resume.skills = analysis.skills || [];
  resume.technicalSkills = analysis.technicalSkills || [];
  resume.softSkills = analysis.softSkills || [];
  resume.missingSkills = analysis.missingSkills || [];
  resume.strengths = analysis.strengths || [];
  resume.weaknesses = analysis.weaknesses || [];
  resume.suggestions = analysis.suggestions || [];
  resume.interviewQuestions = analysis.interviewQuestions || [];
  resume.experience = analysis.experience || [];
  resume.projects = analysis.projects || [];
  resume.education = analysis.education || [];
  resume.certifications = analysis.certifications || [];
  resume.recommendedTopics = analysis.recommendedTopics || [];
  resume.recommendedDifficulty = analysis.recommendedDifficulty || "medium";
  resume.analyzedAt = new Date();

  await resume.save();

  return resume;
};

module.exports = {
  uploadResume,
  getUserResumes,
  getResumeById,
  deleteResume,
  analyzeResume,
};

