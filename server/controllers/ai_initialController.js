const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

// Create a new instance of the GoogleGenerativeAI class
const genai = new GoogleGenerativeAI('AIzaSyDgGTVYFLvYWehsxKrgLDSbxg4VE73jbLs');
const model = genai.getGenerativeModel({ model: "gemini-1.5-flash" });
async function initial(req,res) {
    console.log(req);
  try {
    const prompt = "What color is the sky?";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);
  } catch (err) {
    console.error("Error generating content:", err);
  }
}
// Run if file is executed directly
if (require.main === module) {
  initial();
}

module.exports = { initial };