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

app = FastAPI(title="Smart Functional Requirements Analyzer", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini AI
genai.configure(api_key="AIzaSyBul7g3Q17OBnvD_H5hcFAMTVp8fUjKkqU")  # Replace with your actual API key
model = genai.GenerativeModel('gemini-2.0-flash-exp')

# Single global conversation (resets when server restarts)
conversation_history: List[Dict[str, str]] = []
current_functional_requirements: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    functional_requirements: Optional[Dict[str, Any]] = None
    is_initial_analysis: bool

def extract_text(response) -> str:
    """Safely extract text from Gemini response"""
    if hasattr(response, "text") and response.text:
        return response.text.strip()
    elif hasattr(response, "candidates") and response.candidates:
        parts = response.candidates[0].content.parts
        return " ".join([p.text for p in parts if hasattr(p, "text")])
    else:
        return ""

def generate_initial_functional_requirements(project_description: str) -> tuple[Dict[str, Any], str]:
    """Generate initial functional requirements from project description"""
    
    system_prompt = """You are an expert business analyst and requirements engineer. When given a project description, generate comprehensive functional requirements in JSON format.

Include these sections ONLY if relevant to the project:
- project_overview: Brief summary and scope
- stakeholders: Primary users, secondary users, administrators, external systems
- user_stories: Organized by user role with acceptance criteria
- core_functions: Main system capabilities and business logic
- user_interface_requirements: UI/UX requirements, workflows, navigation
- data_requirements: Data entities, validation rules, storage needs
- integration_requirements: External APIs, third-party services, data exchanges
- business_rules: Validation rules, constraints, calculations
- reporting_requirements: Reports, analytics, dashboards needed
- security_requirements: Authentication, authorization, data protection
- performance_requirements: Response times, throughput, scalability needs
- compliance_requirements: Regulatory, legal, industry standards

For user stories, use format:
- As a [user type], I want [goal] so that [benefit]
- Acceptance criteria as bullet points

Be intelligent about what's needed based on the project type. Don't include irrelevant sections.

Respond with:
1. A valid JSON functional requirements document
2. A brief explanation message

Format your response as:
FUNCTIONAL_REQUIREMENTS: {json here}
MESSAGE: Your explanation here"""

    prompt = f"Analyze this project and create comprehensive functional requirements: {project_description}"
    
    try:
        response = model.generate_content(f"{system_prompt}\n\n{prompt}")
        response_text = extract_text(response)
        
        # Parse the response
        if "FUNCTIONAL_REQUIREMENTS:" in response_text and "MESSAGE:" in response_text:
            parts = response_text.split("MESSAGE:")
            json_part = parts[0].replace("FUNCTIONAL_REQUIREMENTS:", "").strip()
            message_part = parts[1].strip()
        else:
            # Try to extract JSON from response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_part = json_match.group()
                message_part = "Functional requirements generated successfully!"
            else:
                raise ValueError("Could not parse response")
        
        # Clean JSON
        if json_part.startswith("```json"):
            json_part = json_part[7:-3]
        elif json_part.startswith("```"):
            json_part = json_part[3:-3]
        
        functional_requirements = json.loads(json_part)
        return functional_requirements, message_part
        
    except Exception as e:
        logging.error(f"Error generating initial requirements: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate functional requirements: {str(e)}")

def update_functional_requirements(message: str) -> tuple[Dict[str, Any], str]:
    """Update existing functional requirements based on user message and conversation history"""
    
    system_prompt = """You are an expert business analyst and requirements engineer. Based on the conversation history and current functional requirements, update the requirements according to the user's new input.

Intelligently modify the existing requirements:
- If they add new features, create new user stories and update related sections
- If they change business rules, update validation and business logic
- If they modify user roles, update stakeholders and user stories
- If they add integrations, update integration requirements
- If they change data needs, update data requirements
- Update acceptance criteria, performance needs, security accordingly
- Be smart about cascading changes across all sections

Return the complete updated functional requirements in the same JSON format, plus a brief message explaining what changed.

Format your response as:
FUNCTIONAL_REQUIREMENTS: {updated json here}
MESSAGE: Brief explanation of changes made"""

    # Build context
    context = "CURRENT FUNCTIONAL REQUIREMENTS:\n" + json.dumps(current_functional_requirements, indent=2) + "\n\n"
    context += "CONVERSATION HISTORY:\n"
    for msg in conversation_history[-6:]:  # Last 6 messages for context
        context += f"{msg['role'].title()}: {msg['content']}\n"
    
    prompt = f"{context}\nUser: {message}\n\nUpdate the functional requirements based on this new input."
    
    try:
        response = model.generate_content(f"{system_prompt}\n\n{prompt}")
        response_text = extract_text(response)
        
        # Parse the response
        if "FUNCTIONAL_REQUIREMENTS:" in response_text and "MESSAGE:" in response_text:
            parts = response_text.split("MESSAGE:")
            json_part = parts[0].replace("FUNCTIONAL_REQUIREMENTS:", "").strip()
            message_part = parts[1].strip()
        else:
            # Try to extract JSON from response
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_part = json_match.group()
                message_part = "Functional requirements updated successfully!"
            else:
                raise ValueError("Could not parse response")
        
        # Clean JSON
        if json_part.startswith("```json"):
            json_part = json_part[7:-3]
        elif json_part.startswith("```"):
            json_part = json_part[3:-3]
        
        updated_requirements = json.loads(json_part)
        return updated_requirements, message_part
        
    except Exception as e:
        logging.error(f"Error updating requirements: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update functional requirements: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Single endpoint for both initial requirements analysis and modifications"""
    global conversation_history, current_functional_requirements
    
    try:
        # Add user message to conversation history
        user_message = {
            "role": "user",
            "content": request.message,
            "timestamp": datetime.now().isoformat()
        }
        conversation_history.append(user_message)
        
        # Check if this is the first message (initial analysis)
        is_initial = len(conversation_history) == 1
        
        if is_initial:
            # Generate initial functional requirements
            functional_requirements, ai_message = generate_initial_functional_requirements(request.message)
            current_functional_requirements = functional_requirements
        else:
            # Update existing functional requirements
            if not current_functional_requirements:
                raise HTTPException(status_code=400, detail="No existing functional requirements found")
            functional_requirements, ai_message = update_functional_requirements(request.message)
            current_functional_requirements = functional_requirements
        
        # Add AI response to conversation history
        ai_response = {
            "role": "assistant",
            "content": ai_message,
            "timestamp": datetime.now().isoformat()
        }
        conversation_history.append(ai_response)
        
        return ChatResponse(
            response=ai_message,
            functional_requirements=functional_requirements,
            is_initial_analysis=is_initial
        )
        
    except Exception as e:
        logging.error(f"Error in /chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
async def get_conversation_history():
    """Get the current conversation history"""
    return {
        "conversation_history": conversation_history,
        "current_functional_requirements": current_functional_requirements,
        "message_count": len(conversation_history)
    }

@app.post("/reset")
async def reset_conversation():
    """Reset the conversation and functional requirements"""
    global conversation_history, current_functional_requirements
    conversation_history = []
    current_functional_requirements = None
    return {"message": "Conversation reset successfully"}

@app.get("/")
async def root():
    return {
        "message": "Smart Functional Requirements Analyzer API - No Sessions",
        "version": "1.0.0",
        "usage": {
            "initial_analysis": "POST /chat with your project description",
            "modify_requirements": "POST /chat with your changes or additions",
            "example_flow": [
                "POST /chat: {'message': 'E-commerce platform for selling handmade crafts'}",
                "POST /chat: {'message': 'Add support for auction-style listings'}",
                "POST /chat: {'message': 'Include seller verification system'}",
                "POST /chat: {'message': 'Add mobile app requirements'}",
                "POST /chat: {'message': 'Remove guest checkout, require user registration'}"
            ]
        },
        "endpoints": {
            "chat": "POST /chat - Main endpoint for requirements analysis and modifications",
            "history": "GET /history - Get conversation history and current requirements",
            "reset": "POST /reset - Clear conversation and start over"
        },
        "features": {
            "generates": [
                "User stories with acceptance criteria",
                "Stakeholder analysis",
                "Core functional requirements",
                "Business rules and validation",
                "Integration requirements",
                "Performance and security requirements",
                "Data and reporting requirements"
            ],
            "supports": [
                "Iterative requirements refinement",
                "Intelligent requirement updates",
                "Conversation context awareness",
                "JSON-structured output"
            ]
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=4000)