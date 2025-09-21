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

# The rest of your FastAPI code goes here...
# ... (imports, app setup, etc.) ...

def generate_initial_functional_requirements(project_description: str) -> tuple[Dict[str, Any], str]:
    """Generate initial functional requirements from project description with retries."""
    
    system_prompt = """You are an expert business analyst and requirements engineer. When given a project description, generate comprehensive functional requirements in JSON format.
    ... (rest of your system prompt) ...
    """
    prompt = f"Analyze this project and create comprehensive functional requirements: {project_description}"
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = model.generate_content(f"{system_prompt}\n\n{prompt}")
            response_text = extract_text(response)
            
            # Use regex to find the most likely JSON object
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_part = json_match.group()
            else:
                raise ValueError("Could not find a JSON object in the response.")
            
            # Clean JSON
            json_part = json_part.replace("```json", "").replace("```", "").strip()
            
            # Attempt to parse
            functional_requirements = json.loads(json_part)
            
            # Extract the message if it exists
            message_part = "Functional requirements generated successfully."
            if "MESSAGE:" in response_text:
                message_part = response_text.split("MESSAGE:", 1)[1].strip()
            
            return functional_requirements, message_part
            
        except json.JSONDecodeError as e:
            logging.warning(f"Attempt {attempt + 1}/{max_retries}: Failed to decode JSON. Retrying... Error: {e}")
            # Modify the prompt for the next attempt to "fix" the JSON
            prompt = f"The previous JSON was malformed. Please fix it and return a valid JSON object. Here is the malformed JSON:\n{json_part}"
            if attempt == max_retries - 1:
                logging.error("Max retries exceeded for JSON generation.")
                raise HTTPException(status_code=500, detail=f"Failed to generate valid functional requirements after {max_retries} attempts. Error: {str(e)}")
        except Exception as e:
            logging.error(f"An unexpected error occurred: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to generate functional requirements: {str(e)}")

# Apply a similar retry logic to the update_functional_requirements function
def update_functional_requirements(message: str) -> tuple[Dict[str, Any], str]:
    # ... (rest of your system prompt) ...
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            # The core logic for generating the update prompt
            # ...
            response = model.generate_content(f"{system_prompt}\n\n{prompt}")
            response_text = extract_text(response)
            
            # Use regex to find the most likely JSON object
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                json_part = json_match.group()
            else:
                raise ValueError("Could not find a JSON object in the response.")

            json_part = json_part.replace("```json", "").replace("```", "").strip()
            
            updated_requirements = json.loads(json_part)
            
            message_part = "Functional requirements updated successfully."
            if "MESSAGE:" in response_text:
                message_part = response_text.split("MESSAGE:", 1)[1].strip()
            
            return updated_requirements, message_part
            
        except json.JSONDecodeError as e:
            logging.warning(f"Attempt {attempt + 1}/{max_retries}: Failed to decode JSON. Retrying... Error: {e}")
            prompt = f"The previous JSON was malformed. Please fix the syntax and return a valid JSON object. Here is the malformed JSON:\n{json_part}"
            if attempt == max_retries - 1:
                logging.error("Max retries exceeded for JSON update.")
                raise HTTPException(status_code=500, detail=f"Failed to update functional requirements after {max_retries} attempts. Error: {str(e)}")
        except Exception as e:
            logging.error(f"An unexpected error occurred: {e}")
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