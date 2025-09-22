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

app = FastAPI(title="Smart Non-Functional Requirements Analyzer", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini AI
genai.configure(api_key="AIzaSyCra4zMjIaJBCCv7iC2jbdNM6vIdUx9wTc")  # Replace with your actual API key
model = genai.GenerativeModel('gemini-2.0-flash-exp')

# Single global conversation (resets when server restarts)
conversation_history: List[Dict[str, str]] = []
current_non_functional_requirements: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    non_functional_requirements: Optional[Dict[str, Any]] = None
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

def clean_json_string(json_str: str) -> str:
    """Clean JSON string to remove common formatting issues"""
    # Remove code blocks
    if json_str.startswith("```json"):
        json_str = json_str[7:]
    if json_str.startswith("```"):
        json_str = json_str[3:]
    if json_str.endswith("```"):
        json_str = json_str[:-3]
    
    # Remove trailing commas before closing brackets/braces
    json_str = re.sub(r',(\s*[}\]])', r'\1', json_str)
    
    # Fix common JSON issues
    json_str = json_str.strip()
    return json_str

def generate_initial_non_functional_requirements(project_description: str) -> tuple[Dict[str, Any], str]:
    """Generate initial non-functional requirements from project description"""
    
    system_prompt = """You are an expert quality assurance engineer and system architect. When given a project description, generate comprehensive non-functional requirements (NFRs) in JSON format.

Include these quality attribute categories ONLY if relevant to the project:
- performance_requirements: Response times, throughput, capacity, scalability metrics
- availability_requirements: Uptime, recovery time, maintenance windows, disaster recovery
- reliability_requirements: MTBF, error rates, fault tolerance, backup strategies  
- security_requirements: Authentication, authorization, encryption, compliance standards
- usability_requirements: User experience, accessibility, interface standards, learning curve
- compatibility_requirements: Browser support, OS compatibility, integration standards
- maintainability_requirements: Code standards, documentation, modularity, testability
- portability_requirements: Platform independence, deployment flexibility, migration support
- scalability_requirements: Load handling, resource scaling, growth projections
- compliance_requirements: Regulatory standards, industry certifications, legal requirements
- operational_requirements: Monitoring, logging, deployment, backup procedures
- environmental_requirements: Hardware specs, network requirements, infrastructure needs

For each category, include:
- specific_metrics: Quantifiable targets and thresholds (as array of strings)
- testing_criteria: How to verify and validate requirements (as array of strings)
- constraints: Limitations and boundaries (as array of strings)
- priority_level: Critical, High, Medium, Low (as string)

IMPORTANT: 
1. Generate ONLY valid JSON - no trailing commas, proper quotes
2. Use arrays for lists, strings for single values
3. Ensure all JSON is properly formatted

Be intelligent about what's needed based on the project type. Don't include irrelevant categories.

Respond ONLY with valid JSON - no explanations or markdown formatting."""

    prompt = f"Analyze this project and create comprehensive non-functional requirements: {project_description}"
    
    try:
        response = model.generate_content(f"{system_prompt}\n\n{prompt}")
        response_text = extract_text(response)
        
        # Clean the JSON string
        cleaned_json = clean_json_string(response_text)
        
        # Try to parse JSON
        try:
            non_functional_requirements = json.loads(cleaned_json)
            message = "Non-functional requirements generated successfully!"
            return non_functional_requirements, message
        except json.JSONDecodeError as e:
            logging.error(f"JSON parsing failed: {e}")
            logging.error(f"Raw response: {response_text[:500]}...")
            
            # Fallback: create basic structure
            fallback_nfr = {
                "performance_requirements": {
                    "specific_metrics": ["Response time under 2 seconds", "Support 1000 concurrent users"],
                    "testing_criteria": ["Load testing", "Performance monitoring"],
                    "constraints": ["Hardware limitations"],
                    "priority_level": "High"
                },
                "security_requirements": {
                    "specific_metrics": ["Data encryption", "User authentication"],
                    "testing_criteria": ["Security audit", "Penetration testing"],
                    "constraints": ["Compliance requirements"],
                    "priority_level": "Critical"
                }
            }
            return fallback_nfr, f"Generated basic requirements (JSON parsing issue: {str(e)})"
        
    except Exception as e:
        logging.error(f"Error generating initial NFRs: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate non-functional requirements: {str(e)}")

def update_non_functional_requirements(message: str) -> tuple[Dict[str, Any], str]:
    """Update existing non-functional requirements based on user message and conversation history"""
    
    system_prompt = """You are an expert quality assurance engineer and system architect. Based on the conversation history and current non-functional requirements, update the NFRs according to the user's new input.

Intelligently modify the existing requirements:
- If they change performance targets, update metrics and testing criteria
- If they add security concerns, enhance security requirements and compliance
- If they modify user base, adjust scalability and performance requirements
- If they change platforms, update compatibility and portability requirements
- If they add regulations, update compliance and operational requirements
- Update testing criteria, constraints, and priority levels accordingly
- Be smart about cascading changes across quality attributes

For each category, include:
- specific_metrics: Quantifiable targets and thresholds (as array of strings)
- testing_criteria: How to verify and validate requirements (as array of strings) 
- constraints: Limitations and boundaries (as array of strings)
- priority_level: Critical, High, Medium, Low (as string)

IMPORTANT:
1. Generate ONLY valid JSON - no trailing commas, proper quotes
2. Use arrays for lists, strings for single values
3. Return the complete updated requirements structure

Respond ONLY with valid JSON - no explanations or markdown formatting."""

    # Build context
    context = "CURRENT NON-FUNCTIONAL REQUIREMENTS:\n" + json.dumps(current_non_functional_requirements, indent=2) + "\n\n"
    context += "CONVERSATION HISTORY:\n"
    for msg in conversation_history[-6:]:  # Last 6 messages for context
        context += f"{msg['role'].title()}: {msg['content']}\n"
    
    prompt = f"{context}\nUser: {message}\n\nUpdate the non-functional requirements based on this new input."
    
    try:
        response = model.generate_content(f"{system_prompt}\n\n{prompt}")
        response_text = extract_text(response)
        
        # Clean the JSON string
        cleaned_json = clean_json_string(response_text)
        
        # Try to parse JSON
        try:
            updated_requirements = json.loads(cleaned_json)
            message_text = "Non-functional requirements updated successfully!"
            return updated_requirements, message_text
        except json.JSONDecodeError as e:
            logging.error(f"JSON parsing failed during update: {e}")
            logging.error(f"Raw response: {response_text[:500]}...")
            
            # Return current requirements unchanged if parsing fails
            return current_non_functional_requirements, f"Update failed due to JSON parsing error: {str(e)}"
        
    except Exception as e:
        logging.error(f"Error updating NFRs: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update non-functional requirements: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Single endpoint for both initial NFR analysis and modifications"""
    global conversation_history, current_non_functional_requirements
    print("fwefwef")
    print(request.message)
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
            # Generate initial non-functional requirements
            nfr, ai_message = generate_initial_non_functional_requirements(request.message)
            current_non_functional_requirements = nfr
        else:
            # Update existing non-functional requirements
            if not current_non_functional_requirements:
                raise HTTPException(status_code=400, detail="No existing non-functional requirements found")
            nfr, ai_message = update_non_functional_requirements(request.message)
            current_non_functional_requirements = nfr
        
        # Add AI response to conversation history
        ai_response = {
            "role": "assistant",
            "content": ai_message,
            "timestamp": datetime.now().isoformat()
        }
        conversation_history.append(ai_response)
        
        return ChatResponse(
            response=ai_message,
            non_functional_requirements=nfr,
            is_initial_analysis=is_initial
        )
        
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
async def get_conversation_history():
    """Get the current conversation history"""
    return {
        "conversation_history": conversation_history,
        "current_non_functional_requirements": current_non_functional_requirements,
        "message_count": len(conversation_history)
    }

@app.post("/reset")
async def reset_conversation():
    """Reset the conversation and non-functional requirements"""
    global conversation_history, current_non_functional_requirements
    conversation_history = []
    current_non_functional_requirements = None
    return {"message": "Conversation reset successfully"}

@app.get("/")
async def root():
    return {
        "message": "Smart Non-Functional Requirements Analyzer API - No Sessions",
        "version": "1.0.0",
        "usage": {
            "initial_analysis": "POST /chat with your project description",
            "modify_requirements": "POST /chat with your changes or additions",
            "example_flow": [
                "POST /chat: {'message': 'High-traffic e-commerce platform for 1M users'}",
                "POST /chat: {'message': 'Need 99.9% uptime and sub-200ms response times'}",
                "POST /chat: {'message': 'Add PCI DSS compliance for payments'}",
                "POST /chat: {'message': 'Support mobile apps and web browsers'}",
                "POST /chat: {'message': 'Handle Black Friday traffic spikes'}"
            ]
        },
        "endpoints": {
            "chat": "POST /chat - Main endpoint for NFR analysis and modifications",
            "history": "GET /history - Get conversation history and current requirements",
            "reset": "POST /reset - Clear conversation and start over"
        },
        "quality_attributes": {
            "performance": "Response times, throughput, capacity planning",
            "availability": "Uptime, recovery, maintenance windows",
            "reliability": "MTBF, error rates, fault tolerance", 
            "security": "Authentication, encryption, compliance",
            "usability": "User experience, accessibility standards",
            "scalability": "Load handling, resource scaling",
            "compatibility": "Platform support, integration standards",
            "maintainability": "Code quality, testing, documentation",
            "portability": "Platform independence, deployment flexibility",
            "compliance": "Regulatory standards, certifications",
            "operational": "Monitoring, logging, deployment procedures",
            "environmental": "Hardware, network, infrastructure needs"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=6888)