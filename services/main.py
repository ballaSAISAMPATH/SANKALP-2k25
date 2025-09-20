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
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini API
genai.configure(api_key="AIzaSyBAJHmxT_JPxYRvsM8006-oF_r7jYhw2sM")
model = genai.GenerativeModel('gemini-2.0-flash-exp')

# Single global conversation history
conversation_history: List[Dict[str, str]] = []
analyzer = None

class ChatRequest(BaseModel):
    message: str
class ChatResponse(BaseModel):
    response: str
    satisfied: bool
    final_prompt: Optional[str] = None
    options: Optional[List[str]] = None
def extract_text(response) -> str:
    """Safely extract text from Gemini response"""
    if hasattr(response, "text") and response.text:
        return response.text.strip()
    elif hasattr(response, "candidates") and response.candidates:
        parts = response.candidates[0].content.parts
        return " ".join([p.text for p in parts if hasattr(p, "text")])
    else:
        return ""

class OptimizedBusinessAnalyzer:
    def __init__(self):
        self.question_count = 0
        self.max_questions = 3  # Reduced to maximum 3 questions
        self.asked_categories = set()  # Track what we've already asked about

    def get_next_essential_question(self) -> tuple[Optional[str], Optional[List[str]]]:
        return self.generate_strategic_question(conversation_history)

    def is_satisfied(self) -> bool:
        # Check if we have enough info OR reached max questions
        if self.question_count >= self.max_questions:
            return True
        return self.has_sufficient_business_info(conversation_history)

    def has_sufficient_business_info(self, conversation: List[Dict]) -> bool:
        """Check if we have the core business information needed"""
        conversation_text = "\n".join([
            f"{'User' if msg['role'] == 'user' else 'Assistant'}: {msg['content']}"
            for msg in conversation
        ])

        analysis_prompt = f"""You are analyzing a business consultation conversation. Determine if you have SUFFICIENT information to create a solid business plan.

CONVERSATION:
{conversation_text}

You HAVE ENOUGH information if you can clearly understand:
1. What the business does/sells
2. Who the target customers are (even generally)
3. How the business will make money

You DON'T NEED to know:
- Exact financial details (you can estimate)
- Specific operational details (you can recommend)
- Marketing specifics (you can suggest)
- Legal structures (you can advise)

Be lenient - if you understand the core business concept and target market, that's usually enough to create a comprehensive business plan with recommendations.

Respond with ONLY "SUFFICIENT" or "NEED_MORE" - nothing else."""

        response = model.generate_content(analysis_prompt)
        reply = extract_text(response)
        logging.info(f"Sufficiency check: {reply}")
        return "SUFFICIENT" in reply.upper()

    def generate_strategic_question(self, conversation: List[Dict]) -> tuple[Optional[str], Optional[List[str]]]:
        """Generate only the most critical questions that can't be self-answered"""
        conversation_text = "\n".join([
            f"{'User' if msg['role'] == 'user' else 'Assistant'}: {msg['content']}"
            for msg in conversation
        ])

        strategic_prompt = f"""You are a business consultant. Based on this conversation, identify the ONE most critical piece of information you're missing that you CANNOT reasonably assume or recommend yourself.

CONVERSATION:
{conversation_text}

RULES:
1. ONLY ask about things you absolutely CANNOT infer or recommend
2. Focus on USER-SPECIFIC information that only they know
3. Don't ask about things you can research or recommend (like marketing strategies, legal structures, etc.)
4. Ask about their specific situation, constraints, or preferences
5. Make it actionable for their specific business idea

CRITICAL AREAS (only ask if truly unknown):
- Target market specifics (if business serves multiple very different markets)
- Business model choice (if multiple viable models exist for their idea) 
- Scale/scope preferences (if it significantly affects the business plan)
- Resource constraints (if it's crucial for planning)

If you have enough info to create a solid business plan with recommendations, return: {{"question": null, "options": null}}

Otherwise, return JSON:
{{
    "question": "One specific strategic question?",
    "options": [
        "Option 1",
        "Option 2", 
        "Option 3",
        "Option 4"
    ]
}}"""

        response = model.generate_content(strategic_prompt)
        raw_reply = extract_text(response)
        logging.info(f"Strategic question response: {raw_reply}")

        # Check if AI thinks we have enough info
        if "null" in raw_reply.lower() or "enough" in raw_reply.lower():
            return None, None

        json_match = re.search(r'\{.*\}', raw_reply, re.DOTALL)
        if json_match:
            try:
                question_data = json.loads(json_match.group())
                question = question_data.get("question")
                options = question_data.get("options", [])

                if not question or question == "null":
                    return None, None

                if not options or len(options) < 3:
                    return None, None

                return question, options
            except Exception as e:
                logging.error(f"JSON parse error: {e}")
                return None, None
        
        return None, None

def process_numbered_response(response: str, options: List[str]) -> str:
    try:
        choice_num = int(response.strip())
        if 1 <= choice_num <= len(options):
            return options[choice_num - 1]
        else:
            return response
    except ValueError:
        return response

def generate_comprehensive_prompt(conversation: List[Dict]) -> str:
    """Generate a detailed business plan prompt based on the conversation"""
    conversation_summary = "\n".join([
        f"{'User' if msg['role'] == 'user' else 'Assistant'}: {msg['content']}"
        for msg in conversation
    ])

    final_prompt = f"""You are an expert business consultant. Based on this consultation conversation, create a comprehensive and actionable business plan.

CONSULTATION CONVERSATION:
{conversation_summary}

Create a detailed business plan with these sections:

## 1. EXECUTIVE SUMMARY
- Business concept overview
- Target market summary  
- Unique value proposition
- Revenue model
- Key success factors

## 2. BUSINESS DESCRIPTION & STRATEGY
- Detailed business description
- Products/services offered
- Business model explanation
- Competitive advantages
- Growth strategy

## 3. MARKET ANALYSIS
- Target customer analysis
- Market size and trends
- Competitive landscape
- Market positioning strategy

## 4. MARKETING & SALES STRATEGY
- Customer acquisition strategy
- Marketing channels and tactics
- Sales process and strategy
- Pricing strategy
- Brand positioning

## 5. OPERATIONS PLAN
- Business operations overview
- Required resources and equipment
- Staffing requirements
- Supply chain considerations
- Quality control measures

## 6. FINANCIAL PROJECTIONS & REQUIREMENTS
- Startup costs breakdown
- Revenue projections (Year 1-3)
- Operating expenses forecast
- Break-even analysis
- Funding requirements

## 7. IMPLEMENTATION ROADMAP
- Phase 1: Launch preparation (0-3 months)
- Phase 2: Business launch (3-6 months)
- Phase 3: Growth phase (6-12 months)
- Key milestones and deadlines
- Risk mitigation strategies

## 8. NEXT STEPS & RECOMMENDATIONS
- Immediate action items
- Resource requirements
- Professional services needed
- Key performance indicators

Make all recommendations specific, actionable, and realistic. Include actual numbers, timelines, and practical steps they can implement immediately. Base everything on the information provided in the conversation, but fill in reasonable assumptions where needed."""

    return final_prompt

# API endpoints
@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    global conversation_history, analyzer
    print("hii")
    try:
        # Add user message to conversation
        user_message = {
            "role": "user",
            "content": request.message,
            "timestamp": datetime.now().isoformat()
        }
        conversation_history.append(user_message)

        # First message - initialize and ask first question
        if len(conversation_history) == 1:
            analyzer = OptimizedBusinessAnalyzer()

            # Generate encouraging initial response
            initial_prompt = f"""You are a business consultant. A user wants to start: "{request.message}"

Generate a brief, encouraging response (2-3 sentences) that:
1. Acknowledges their business idea positively
2. Mentions you'll ask just a few key questions to create their business plan
3. Be specific to their business type

Keep it concise and professional."""

            response = model.generate_content(initial_prompt)
            initial_response = extract_text(response)

            # Get first strategic question
            question, options = analyzer.get_next_essential_question()
            analyzer.conversation_count += 1

            if question and options:
                analyzer.question_count += 1
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
                # If no questions needed, go straight to completion
                final_prompt = generate_comprehensive_prompt(conversation_history)
                completion_message = "Great! I have enough information about your business idea. Your comprehensive business plan is ready!"
                
                conversation_history.append({
                    "role": "assistant",
                    "content": completion_message,
                    "timestamp": datetime.now().isoformat()
                })
                
                return ChatResponse(
                    response=completion_message,
                    satisfied=True,
                    final_prompt=final_prompt
                )

        else:
            # Handle numbered responses from options
            if len(conversation_history) >= 2:
                prev_assistant_msg = conversation_history[-2]
                if prev_assistant_msg.get("role") == "assistant":
                    prev_content = prev_assistant_msg.get("content", "")
                    # Extract options from previous message
                    options = []
                    for line in prev_content.split('\n'):
                        if line.strip().startswith(tuple(str(i) + "." for i in range(1, 7))):
                            option = line.split('.', 1)[1].strip()
                            options.append(option)
                    
                    if options:
                        processed_response = process_numbered_response(request.message, options)
                        conversation_history[-1]["content"] = processed_response

            # Check if we should ask another question or finish
            if analyzer.is_satisfied():
                # Generate final business plan
                final_prompt = generate_comprehensive_prompt(conversation_history)
                
                completion_message = "Perfect! I now have everything needed to create your comprehensive business plan. You can use the detailed prompt with any AI to get your complete business plan with financial projections, marketing strategies, and implementation roadmap."
                
                conversation_history.append({
                    "role": "assistant",
                    "content": completion_message,
                    "timestamp": datetime.now().isoformat()
                })
                
                return ChatResponse(
                    response=completion_message,
                    satisfied=True,
                    final_prompt=final_prompt
                )
            else:
                # Ask next strategic question
                question, options = analyzer.get_next_essential_question()
                analyzer.conversation_count += 1
                if question and options:
                    analyzer.question_count += 1
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
                    # If no more strategic questions, finish
                    final_prompt = generate_comprehensive_prompt(conversation_history)
                    completion_message = "Excellent! I have all the key information needed. Your business plan is ready!"
                    
                    conversation_history.append({
                        "role": "assistant",
                        "content": completion_message,
                        "timestamp": datetime.now().isoformat()
                    })
                    
                    return ChatResponse(
                        response=completion_message,
                        satisfied=True,
                        final_prompt=final_prompt
                    )

    except Exception as e:
        logging.error(f"Error in /chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/")
async def root():
    return {"message": "Optimized Business Setup Chatbot API", "version": "3.0.0"}

@app.post("/reset")
async def reset_conversation():
    global conversation_history, analyzer
    conversation_history = []
    analyzer = None
    return {"message": "Conversation reset successfully"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
