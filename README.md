
# NEXGENT

NEX-GENT (derived from NEXUS and GENERATIVE AI)

A MULTI - AGENT AI System that takes ambiguous or raw business objectives, applies intent disambiguation and semantic decomposition to derive structured business concepts, and distributes refined sub-tasks across specialized autonomous agents.

 Each agent specialized in a field generates a comprehensive requirement analysis covering functional and non-functional specifications, optimal capital allocation models, feasibility validation, procedural execution pipelines (from ideation to deployment), and predictive simulations.
 
  The system also delivers data-driven visualizations of projected ROI, growth trajectories, and long-term performance metrics using advanced multi-modal reasoning and agentic coordination.

## Authors

- [@ballaSAISAMPATH](https://www.github.com/ballaSAISAMPATH)
- [@praveengamini](https://www.github.com/praveengamini)

## API Reference

### Auth Routes
- Register User: POST /api/auth/register
- Login User: POST /api/auth/login
- Logout User: POST /api/auth/logout
- Google Login: POST /api/auth/google-login
- Delete Account: DELETE /api/auth/delete-account
- Change Password: POST /api/auth/setnewpassword
- Refresh Access Token: POST /api/auth/refresh
- Check Authentication: GET /api/auth/check-auth

### OTP Routes
- Send OTP: POST /api/otp/send
- Verify OTP: POST /api/otp/verify
- Resend OTP: POST /api/otp/resend
- Change Password (via OTP): POST /api/otp/change-password

### Prompt Routes
- Store Prompt: POST /user/storeMongoDb
- Get All Prompts: GET /user/storeMongoDb

---

## Parameters

### Auth Routes

| Route | Parameter  | Type     | Description                |
| :---- | :--------- | :------- | :------------------------- |
| /api/auth/register | `name`     | `string` | User's full name           |
| /api/auth/register | `email`    | `string` | User's email address       |
| /api/auth/register | `password` | `string` | User password              |
| /api/auth/login    | `email`    | `string` | User's email               |
| /api/auth/login    | `password` | `string` | User password              |
| /api/auth/check-auth | `api_key` | `string` | Authentication key        |

### OTP Routes

| Route | Parameter | Type     | Description              |
| :---- | :-------- | :------- | :----------------------- |
| /api/otp/send           | `id` | `string` | unique string created |
| /api/otp/verify         | `id` | `string` | unique string created |
| /api/otp/resend         | `id` | `string` | unique string created |
| /api/otp/change-password| `id` | `string` | unique string created |

### Prompt Routes

| Route | Parameter       | Type     | Description                  |
| :---- | :-------------- | :------- | :--------------------------- |
| /user/storeMongoDb | `prompt` | `string` | Prompt to store in MongoDB |
| /user/storeMongoDb | `id`     | `string` | Stored prompts in DB       |

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`GEMINI_API_KEY`



## Features

## Features

- Multi-agent AI system for handling complex business objectives
- Intent disambiguation and semantic decomposition of raw inputs
- Automatic breakdown of tasks across specialized autonomous agents
- Generation of functional and non-functional requirement analyses
- Optimal capital allocation and feasibility validation
- End-to-end procedural execution pipelines (from ideation to deployment)
- Predictive simulations for business performance
- Data-driven visualizations of ROI, growth trajectories, and long-term metrics
- Advanced multi-modal reasoning and agentic coordination


## 🚀 About Me
I'm a full stack developer...

## Installation

### Frontend (React + Vite)
1. Clone the repository:
git clone <https://github.com/ballaSAISAMPATH/SANKALP-2k25.git>
cd <client>

2. Install dependencies and run:
```
npm install
npm run dev
```
### Backend (Node.js Server)
1. Navigate to the backend folder:
```
cd <server>
```
2. Install dependencies:
```
npm install
```
3. Start the server:
```
npm run start
```
> Make sure your `.env` file is configured with `MONGO_URI`, `CLIENT_ORIGIN`, and other necessary environment variables.

### Python Backend (Optional)
1. Create and activate virtual environment:
```
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate
```
2. Install dependencies:
```
pip install -r requirements.txt
```
3. Run server:
```
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
## License

[self](https://choosealicense.com/licenses/mit/)


## Tech Stack

**Client:** React, Redux, TailwindCSS

**Server:** Node, Express

**Database:** MongoDb

**AI:** Agentic Langchain



## Used By

This project is used by the following companies:

- Sankalp - 2025

