from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime
import google.generativeai as genai
import os
import json
import re
from fastapi.middleware.cors import CORSMiddleware
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Business Setup Chatbot", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # be explicit
    allow_credentials=True,  # change to True
    allow_methods=["*"],
    allow_headers=["*"],
)


# Configure Gemini API
genai.configure(api_key="AIzaSyCdBMzbk72SZ0NhjqSFb0xuBTOszJMlPcw")  # replace with your valid key
model = genai.GenerativeModel('gemini-2.0-flash-exp')

# Single global conversation history (resets when server restarts)
conversation_history: List[Dict[str, str]] = []
analyzer = None

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    satisfied: bool
    final_prompt: Optional[str] = None
    options: Optional[List[str]] = None


# ---------- Helper functions ----------

def extract_text(response) -> str:
    """Safely extract text from Gemini response"""
    if hasattr(response, "text") and response.text:
        return response.text.strip()
    elif hasattr(response, "candidates") and response.candidates:
        parts = response.candidates[0].content.parts
        return " ".join([p.text for p in parts if hasattr(p, "text")])
    else:
        return ""


class StreamlinedBusinessAnalyzer:
    def __init__(self):
        self.conversation_count = 0
        self.max_questions = 5

    def get_next_essential_question(self) -> tuple[Optional[str], Optional[List[str]]]:
        return self.generate_next_question(conversation_history)

    def is_satisfied(self) -> bool:
        return self.analyze_conversation_completeness(conversation_history)

    def analyze_conversation_completeness(self, conversation: List[Dict]) -> bool:
        conversation_text = "\n".join([
            f"{'User' if msg['role'] == 'user' else 'Assistant'}: {msg['content']}"
            for msg in conversation
        ])

        completeness_prompt = f"""You are a business consultant. Analyze this conversation to determine if you have enough information to create a comprehensive business plan.

CONVERSATION:
{conversation_text}

Consider:
- Do you understand the business concept clearly?
- Do you know who the customers are?
- Do you understand how money will be made?
- Do you know how the business will operate?
- Do you understand resources/timeline needs?

Respond with ONLY "COMPLETE" or "CONTINUE" - nothing else."""

        response = model.generate_content(completeness_prompt)
        reply = extract_text(response)
        logging.info(f"Completeness check reply: {reply}")
        return "COMPLETE" in reply.upper()

    def generate_next_question(self, conversation: List[Dict]) -> tuple[Optional[str], Optional[List[str]]]:
        conversation_text = "\n".join([
            f"{'User' if msg['role'] == 'user' else 'Assistant'}: {msg['content']}"
            for msg in conversation
        ])

        question_prompt = f"""You are a business consultant. Based on this conversation, generate the MOST IMPORTANT next question to help create a business plan.

CONVERSATION SO FAR:
{conversation_text}

Generate ONE specific question with exactly 4-6 multiple choice options that will help you understand:
- What hasn't been covered yet that's critical for this business
- The most important missing piece of information
- Something specific to THEIR business idea, not generic

IMPORTANT: The user will respond with ONLY a number (1-6) corresponding to one of your options. Make sure all options are comprehensive and cover the main possibilities for this question.

Return ONLY this JSON format:
{{
    "question": "Your specific question here?",
    "options": [
        "Option 1 specific to their business",
        "Option 2 specific to their business", 
        "Option 3 specific to their business",
        "Option 4 specific to their business",
        "Option 5 (if needed)",
        "Option 6 (if needed)"
    ]
}}"""

        response = model.generate_content(question_prompt)
        raw_reply = extract_text(response)
        logging.info(f"Raw Gemini Question JSON: {raw_reply}")

        json_match = re.search(r'\{.*\}', raw_reply, re.DOTALL)
        if json_match:
            try:
                question_data = json.loads(json_match.group())
                question = question_data.get("question")
                options = question_data.get("options", [])

                if not question or not options or len(options) < 3:
                    raise ValueError("Invalid question format")

                return question, options
            except Exception as e:
                logging.error(f"JSON parse error: {e}")
                raise HTTPException(status_code=500, detail="Invalid question format from Gemini")
        else:
            raise HTTPException(status_code=500, detail="Failed to parse question JSON from Gemini")


def process_numbered_response(response: str, options: List[str]) -> str:
    try:
        choice_num = int(response.strip())
        if 1 <= choice_num <= len(options):
            return options[choice_num - 1]
        else:
            return response
    except ValueError:
        return response


def generate_final_prompt(conversation: List[Dict]) -> str:
    conversation_summary = "\n".join([
        f"{'User' if msg['role'] == 'user' else 'Assistant'}: {msg['content']}"
        for msg in conversation
    ])

    final_prompt = f"""You are a business planning expert. Based on the following consultation conversation, create a comprehensive business plan.

CONSULTATION CONVERSATION:
{conversation_summary}

Create a detailed business plan with these sections:

1. EXECUTIVE SUMMARY
2. BUSINESS DESCRIPTION & STRATEGY
3. MARKET ANALYSIS
4. MARKETING & SALES PLAN
5. OPERATIONS PLAN
6. FINANCIAL PROJECTIONS
7. IMPLEMENTATION ROADMAP
8. APPENDICES

Make all recommendations specific and actionable based on the business discussed. Include realistic timelines, budgets, and practical next steps."""

    return final_prompt


# ---------- API endpoints ----------

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    global conversation_history, analyzer
    print("hii")
    try:
        user_message = {
            "role": "user",
            "content": request.message,
            "timestamp": datetime.now().isoformat()
        }
        conversation_history.append(user_message)

        if len(conversation_history) == 1:
            analyzer = StreamlinedBusinessAnalyzer()

            initial_prompt = f"""You are a business consultant. A user wants to start this business: "{request.message}"

Generate an enthusiastic, encouraging response that:
1. Acknowledges their specific business idea positively
2. Shows genuine interest
3. Mentions you'll ask just a few essential questions
4. Explains they can respond with just numbers
5. Keep it brief and professional
6. Be specific to their business idea

Generate only the response text, nothing else."""

            response = model.generate_content(initial_prompt)
            initial_response = extract_text(response)

            question, options = analyzer.get_next_essential_question()
            analyzer.conversation_count += 1

            if question and options:
                full_response = f"{initial_response}\n\n{question}"
                conversation_history.append({
                    "role": "assistant",
                    "content": full_response,
                    "timestamp": datetime.now().isoformat()
                })
                return ChatResponse(
                    response=question,
                    satisfied=False,
                    options=options
                )

        else:
            if len(conversation_history) >= 2:
                prev_assistant_msg = conversation_history[-2]
                if prev_assistant_msg.get("role") == "assistant":
                    prev_content = prev_assistant_msg.get("content", "")
                    if "1." in prev_content and "2." in prev_content:
                        options = []
                        for line in prev_content.split('\n'):
                            if line.strip().startswith(tuple(str(i) + "." for i in range(1, 7))):
                                option = line.split('.', 1)[1].strip()
                                options.append(option)
                        if options:
                            processed_response = process_numbered_response(request.message, options)
                            conversation_history[-1]["content"] = processed_response

            if analyzer.is_satisfied():
                final_prompt = generate_final_prompt(conversation_history)

                final_response_prompt = """Generate a brief congratulatory message that:
1. Thanks them
2. Mentions their business plan is ready
3. Explains they can use the provided prompt with any AI
Keep it encouraging and concise."""

                response = model.generate_content(final_response_prompt)
                final_response = extract_text(response)

                conversation_history.append({
                    "role": "assistant",
                    "content": final_response,
                    "timestamp": datetime.now().isoformat()
                })

                return ChatResponse(
                    response=final_response,
                    satisfied=True,
                    final_prompt=final_prompt
                )
            else:
                question, options = analyzer.get_next_essential_question()
                analyzer.conversation_count += 1
                if question and options:
                    conversation_history.append({
                        "role": "assistant",
                        "content": question,
                        "timestamp": datetime.now().isoformat()
                    })
                    return ChatResponse(
                        response=question,
                        satisfied=False,
                        options=options
                    )
                else:
                    raise HTTPException(status_code=500, detail="Failed to generate next question")

    except Exception as e:
        logging.error(f"Error in /chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():
    return {"message": "Streamlined Business Setup Chatbot API", "version": "2.0.0"}


@app.post("/reset")
async def reset_conversation():
    global conversation_history, analyzer
    conversation_history = []
    analyzer = None
    return {"message": "Conversation reset successfully"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
