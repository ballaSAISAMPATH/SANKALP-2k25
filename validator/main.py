from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import google.generativeai as genai
import json
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
import logging
import re

# Setup logging
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Smart Project Validator", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Changed to http
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini AI
genai.configure(api_key="AIzaSyAnOE0X5v0mkgly9du6M0V0-7ibOF6Y5Vs")  # Replace with your actual API key
model = genai.GenerativeModel('gemini-2.0-flash-exp')

# Single global conversation (resets when server restarts)
conversation_history: List[Dict[str, str]] = []
current_validation_report: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    validation_report: Optional[Dict[str, Any]] = None
    is_initial_validation: bool

def extract_text(response) -> str:
    """Safely extract text from Gemini response"""
    if hasattr(response, "text") and response.text:
        return response.text.strip()
    elif hasattr(response, "candidates") and response.candidates:
        parts = response.candidates[0].content.parts
        return " ".join([p.text for p in parts if hasattr(p, "text")])
    else:
        return ""

def generate_initial_validation_report(idea: str) -> tuple[Dict[str, Any], str]:
    """Generate initial project validation report from idea"""
    
    system_prompt = """You are an expert project validation consultant. When given a project idea, generate a comprehensive validation report in JSON format.

Include these validation fields ONLY if relevant to the project (no hardcoding, no fallbacks):
- project_name: Clear project name
- concept_summary: Brief project description
- market_validation: Market size, target audience, demand analysis
- competitive_analysis: Competitors, market gaps, positioning
- technical_feasibility: Technology requirements, complexity assessment
- business_model: Revenue streams, pricing strategy, monetization
- risk_assessment: Technical, market, financial, operational risks
- validation_methods: How to test the concept (MVPs, surveys, pilots)
- success_metrics: KPIs and measurement criteria
- resource_requirements: Team, budget, time estimates
- go_to_market: Launch strategy and customer acquisition
- regulatory_compliance: Legal considerations if applicable
- scalability_potential: Growth opportunities and challenges

For each section, provide:
- current_status: Assessment of current state
- validation_needed: What needs to be validated
- recommendations: Specific action items
- confidence_level: High/Medium/Low confidence in assessment

Be intelligent about what validation aspects are most critical based on the project type. Don't include unnecessary sections.

Respond with:
1. A valid JSON validation report
2. A brief explanation message

Format your response as:
VALIDATION_REPORT: {json here}
MESSAGE: Your explanation here"""

    prompt = f"Create a comprehensive project validation report for this idea: {idea}"
    
    try:
        response = model.generate_content(f"{system_prompt}\n\n{prompt}")
        response_text = extract_text(response)
        
        # Parse the response
        if "VALIDATION_REPORT:" in response_text and "MESSAGE:" in response_text:
            parts = response_text.split("MESSAGE:")
            json_part = parts[0].replace("VALIDATION_REPORT:", "").strip()
            message_part = parts[1].strip()
        else:
            # Try to extract JSON from response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_part = json_match.group()
                message_part = "Validation report generated successfully!"
            else:
                raise ValueError("Could not parse response")
        
        # Clean JSON
        if json_part.startswith("```json"):
            json_part = json_part[7:-3]
        elif json_part.startswith("```"):
            json_part = json_part[3:-3]
        
        validation_report = json.loads(json_part)
        return validation_report, message_part
        
    except Exception as e:
        logging.error(f"Error generating initial validation: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate validation report: {str(e)}")

def update_validation_report(message: str) -> tuple[Dict[str, Any], str]:
    """Update existing validation report based on user message and conversation history"""
    
    system_prompt = """You are an expert project validation consultant. Based on the conversation history and current validation report, update the report according to the user's new information or requirements.

Intelligently modify the existing validation:
- If they provide market research data, update market validation
- If they change target audience, update competitive analysis and business model
- If they add new features, reassess technical feasibility and risks
- If they provide budget constraints, update resource requirements
- Update confidence levels, recommendations, and validation methods accordingly
- Be smart about cascading changes across validation areas

Return the complete updated validation report in the same JSON format, plus a brief message explaining what changed.

Format your response as:
VALIDATION_REPORT: {updated json here}
MESSAGE: Brief explanation of changes made"""

    # Build context
    context = "CURRENT VALIDATION REPORT:\n" + json.dumps(current_validation_report, indent=2) + "\n\n"
    context += "CONVERSATION HISTORY:\n"
    for msg in conversation_history[-6:]:  # Last 6 messages for context
        context += f"{msg['role'].title()}: {msg['content']}\n"
    
    prompt = f"{context}\nUser: {message}\n\nUpdate the validation report based on this new information or requirement."
    
    try:
        response = model.generate_content(f"{system_prompt}\n\n{prompt}")
        response_text = extract_text(response)
        
        # Parse the response
        if "VALIDATION_REPORT:" in response_text and "MESSAGE:" in response_text:
            parts = response_text.split("MESSAGE:")
            json_part = parts[0].replace("VALIDATION_REPORT:", "").strip()
            message_part = parts[1].strip()
        else:
            # Try to extract JSON from response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_part = json_match.group()
                message_part = "Validation report updated successfully!"
            else:
                raise ValueError("Could not parse response")
        
        # Clean JSON
        if json_part.startswith("```json"):
            json_part = json_part[7:-3]
        elif json_part.startswith("```"):
            json_part = json_part[3:-3]
        
        updated_report = json.loads(json_part)
        return updated_report, message_part
        
    except Exception as e:
        logging.error(f"Error updating validation: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update validation report: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Single endpoint for both initial project validation and modifications"""
    global conversation_history, current_validation_report
    
    try:
        # Add user message to conversation history
        user_message = {
            "role": "user",
            "content": request.message,
            "timestamp": datetime.now().isoformat()
        }
        conversation_history.append(user_message)
        
        # Check if this is the first message (initial validation)
        is_initial = len(conversation_history) == 1
        
        if is_initial:
            # Generate initial validation report
            validation_report, ai_message = generate_initial_validation_report(request.message)
            current_validation_report = validation_report
        else:
            # Update existing validation report
            if not current_validation_report:
                raise HTTPException(status_code=400, detail="No existing validation report found")
            validation_report, ai_message = update_validation_report(request.message)
            current_validation_report = validation_report
        
        # Add AI response to conversation history
        ai_response = {
            "role": "assistant",
            "content": ai_message,
            "timestamp": datetime.now().isoformat()
        }
        conversation_history.append(ai_response)
        
        return ChatResponse(
            response=ai_message,
            validation_report=validation_report,
            is_initial_validation=is_initial
        )
        
    except Exception as e:
        logging.error(f"Error in /chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
async def get_conversation_history():
    """Get the current conversation history"""
    return {
        "conversation_history": conversation_history,
        "current_validation_report": current_validation_report,
        "message_count": len(conversation_history)
    }

@app.post("/reset")
async def reset_conversation():
    """Reset the conversation and validation report"""
    global conversation_history, current_validation_report
    conversation_history = []
    current_validation_report = None
    return {"message": "Conversation reset successfully"}

@app.get("/")
async def root():
    return {
        "message": "Smart Project Validator API - No Sessions",
        "version": "1.0.0",
        "usage": {
            "initial_validation": "POST /chat with your project idea",
            "modify_validation": "POST /chat with your updates",
            "example_flow": [
                "POST /chat: {'message': 'Social media platform for gamers'}",
                "POST /chat: {'message': 'Target audience is 18-25 year old competitive gamers'}",
                "POST /chat: {'message': 'We have $50k budget and 6 months timeline'}",
                "POST /chat: {'message': 'Focus on mobile gaming community only'}"
            ]
        },
        "endpoints": {
            "chat": "POST /chat - Main endpoint for validation and modifications",
            "history": "GET /history - Get conversation history and current validation report",
            "reset": "POST /reset - Clear conversation and start over"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7000)