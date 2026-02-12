const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ API Key tidak ditemukan di .env!");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listAvailableModels() {
  try {
    console.log("🔄 Sedang mengecek model yang tersedia...");
    const modelResponse = await genAI.getGenerativeModel({ model: "gemini-pro" }).apiKey;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.models) {
      console.log("\n✅ DAFTAR MODEL YANG BISA KAMU PAKAI:");
      console.log("========================================");
      data.models.forEach(model => {
        if (model.supportedGenerationMethods.includes("generateContent")) {
          const cleanName = model.name.replace("models/", "");
          console.log(`- ${cleanName}`);
        }
      });
      console.log("========================================");
      console.log("Silakan copy salah satu nama di atas ke learningController.js");
    } else {
      console.log("Tidak ada model ditemukan atau API Key salah.");
      console.log(data);
    }

  } catch (error) {
    console.error("Error saat fetch model:", error.message);
  }
}

listAvailableModels();