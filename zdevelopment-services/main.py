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

app = FastAPI(title="Smart Project Planner", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Configure Gemini AI
genai.configure(api_key="AIzaSyBAJHmxT_JPxYRvsM8006-oF_r7jYhw2sM")  # Replace with your actual API key
model = genai.GenerativeModel('gemini-2.0-flash-exp')

# Single global conversation (resets when server restarts)
conversation_history: List[Dict[str, str]] = []
current_project_plan: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    project_plan: Optional[Dict[str, Any]] = None
    is_initial_plan: bool

def extract_text(response) -> str:
    """Safely extract text from Gemini response"""
    if hasattr(response, "text") and response.text:
        return response.text.strip()
    elif hasattr(response, "candidates") and response.candidates:
        parts = response.candidates[0].content.parts
        return " ".join([p.text for p in parts if hasattr(p, "text")])
    else:
        return ""

def generate_initial_project_plan(idea: str) -> tuple[Dict[str, Any], str]:
    """Generate initial project plan from idea"""
    
    system_prompt = """You are an expert software project planner. When given a project idea, generate a comprehensive project plan in JSON format.

Include these fields ONLY if relevant to the project (no hardcoding, no fallbacks):
- project_name: Clear project name
- description: Brief project description
- applications: Details about mobile_app, web_app, desktop_app (only if needed)
- website: If a marketing website is needed
- hardware_components: Only if hardware is involved
- infrastructure: Cloud services, databases, authentication, etc.
- resources: Team requirements and skills
- environments: dev, staging, production setup
- scaling_plan: Expected users and scaling strategy
- budget_estimate: Cost breakdown
- timeline: Project phases with duration

For each application type, include:
- platforms: Target platforms
- frontend: Technologies
- backend: Technologies  
- database: Database choice
- features: Key features list

Be intelligent about technology choices based on the project requirements. Don't include unnecessary sections.

Respond with:
1. A valid JSON project plan
2. A brief explanation message

Format your response as:
PROJECT_PLAN: {json here}
MESSAGE: Your explanation here"""

    prompt = f"Create a comprehensive project plan for this idea: {idea}"
    
    try:
        response = model.generate_content(f"{system_prompt}\n\n{prompt}")
        response_text = extract_text(response)
        
        # Parse the response
        if "PROJECT_PLAN:" in response_text and "MESSAGE:" in response_text:
            parts = response_text.split("MESSAGE:")
            json_part = parts[0].replace("PROJECT_PLAN:", "").strip()
            message_part = parts[1].strip()
        else:
            # Try to extract JSON from response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_part = json_match.group()
                message_part = "Project plan generated successfully!"
            else:
                raise ValueError("Could not parse response")
        
        # Clean JSON
        if json_part.startswith("```json"):
            json_part = json_part[7:-3]
        elif json_part.startswith("```"):
            json_part = json_part[3:-3]
        
        project_plan = json.loads(json_part)
        return project_plan, message_part
        
    except Exception as e:
        logging.error(f"Error generating initial plan: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate project plan: {str(e)}")

def update_project_plan(message: str) -> tuple[Dict[str, Any], str]:
    """Update existing project plan based on user message and conversation history"""
    
    system_prompt = """You are an expert software project planner. Based on the conversation history and current project plan, update the plan according to the user's new requirements.

Intelligently modify the existing plan:
- If they change technology stack, update all related sections
- If they remove features, remove related components
- If they add features, add necessary infrastructure
- Update team skills, timeline, budget accordingly
- Be smart about cascading changes

Return the complete updated project plan in the same JSON format, plus a brief message explaining what changed.

Format your response as:
PROJECT_PLAN: {updated json here}
MESSAGE: Brief explanation of changes made"""

    # Build context
    context = "CURRENT PROJECT PLAN:\n" + json.dumps(current_project_plan, indent=2) + "\n\n"
    context += "CONVERSATION HISTORY:\n"
    for msg in conversation_history[-6:]:  # Last 6 messages for context
        context += f"{msg['role'].title()}: {msg['content']}\n"
    
    prompt = f"{context}\nUser: {message}\n\nUpdate the project plan based on this new requirement."
    
    try:
        response = model.generate_content(f"{system_prompt}\n\n{prompt}")
        response_text = extract_text(response)
        
        # Parse the response
        if "PROJECT_PLAN:" in response_text and "MESSAGE:" in response_text:
            parts = response_text.split("MESSAGE:")
            json_part = parts[0].replace("PROJECT_PLAN:", "").strip()
            message_part = parts[1].strip()
        else:
            # Try to extract JSON from response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_part = json_match.group()
                message_part = "Project plan updated successfully!"
            else:
                raise ValueError("Could not parse response")
        
        # Clean JSON
        if json_part.startswith("```json"):
            json_part = json_part[7:-3]
        elif json_part.startswith("```"):
            json_part = json_part[3:-3]
        
        updated_plan = json.loads(json_part)
        return updated_plan, message_part
        
    except Exception as e:
        logging.error(f"Error updating plan: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update project plan: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Single endpoint for both initial project planning and modifications"""
    global conversation_history, current_project_plan
    
    try:
        # Add user message to conversation history
        user_message = {
            "role": "user",
            "content": request.message,
            "timestamp": datetime.now().isoformat()
        }
        conversation_history.append(user_message)
        
        # Check if this is the first message (initial plan)
        is_initial = len(conversation_history) == 1
        
        if is_initial:
            # Generate initial project plan
            project_plan, ai_message = generate_initial_project_plan(request.message)
            current_project_plan = project_plan
        else:
            # Update existing project plan
            if not current_project_plan:
                raise HTTPException(status_code=400, detail="No existing project plan found")
            project_plan, ai_message = update_project_plan(request.message)
            current_project_plan = project_plan
        
        # Add AI response to conversation history
        ai_response = {
            "role": "assistant",
            "content": ai_message,
            "timestamp": datetime.now().isoformat()
        }
        conversation_history.append(ai_response)
        
        return ChatResponse(
            response=ai_message,
            project_plan=project_plan,
            is_initial_plan=is_initial
        )
        
    except Exception as e:
        logging.error(f"Error in /chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
async def get_conversation_history():
    """Get the current conversation history"""
    return {
        "conversation_history": conversation_history,
        "current_project_plan": current_project_plan,
        "message_count": len(conversation_history)
    }

@app.post("/reset")
async def reset_conversation():
    """Reset the conversation and project plan"""
    global conversation_history, current_project_plan
    conversation_history = []
    current_project_plan = None
    return {"message": "Conversation reset successfully"}

@app.get("/")
async def root():
    return {
        "message": "Smart Project Planner API - No Sessions",
        "version": "1.0.0",
        "usage": {
            "initial_plan": "POST /chat with your project idea",
            "modify_plan": "POST /chat with your changes",
            "example_flow": [
                "POST /chat: {'message': 'Social media platform for gamers'}",
                "POST /chat: {'message': 'Use Java Spring Boot instead'}",
                "POST /chat: {'message': 'Add blockchain features'}",
                "POST /chat: {'message': 'Remove mobile app, web only'}"
            ]
        },
        "endpoints": {
            "chat": "POST /chat - Main endpoint for planning and modifications",
            "history": "GET /history - Get conversation history and current plan",
            "reset": "POST /reset - Clear conversation and start over"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000) 