
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
import google.generativeai as genai
import os
import json
import re

app = FastAPI(title="Business Setup Chatbot", version="1.0.0")

# Configure Gemini API
genai.configure(api_key="AIzaSyDgGTVYFLvYWehsxKrgLDSbxg4VE73jbLs")
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

class StreamlinedBusinessAnalyzer:
    def __init__(self):
        self.conversation_count = 0
        self.max_questions = 5  # Keep some limit to prevent infinite loops
    def get_next_essential_question(self) -> tuple[Optional[str], Optional[List[str]]]:
        """Get the next essential question with numbered options"""
        return self.generate_next_question(conversation_history)    
    def is_satisfied(self) -> bool:
        """Check if all essential questions are covered using Gemini analysis"""
        return self.analyze_conversation_completeness(conversation_history)
    def analyze_conversation_completeness(self, conversation: List[Dict]) -> bool:
        """Use Gemini to determine if we have enough information for a business plan"""
        
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
        return "COMPLETE" in response.text.upper()
    
    def generate_next_question(self, conversation: List[Dict]) -> tuple[Optional[str], Optional[List[str]]]:
        """Generate completely dynamic next question based on conversation"""
        
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
        json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
        if json_match:
            question_data = json.loads(json_match.group())
            question = question_data.get("question")
            options = question_data.get("options", [])
            
            # Ensure we have valid question and options
            if not question or not options or len(options) < 3:
                raise HTTPException(status_code=500, detail="Invalid question format from Gemini")
                
            return question, options
        else:
            raise HTTPException(status_code=500, detail="Failed to parse question JSON from Gemini")

def format_options_response(question: str, options: List[str]) -> str:
    """Format question with numbered options"""
    formatted_options = "\n".join([f"{i+1}. {option}" for i, option in enumerate(options)])
    return f"{question}\n\n{formatted_options}\n\nPlease respond with just the number (1-{len(options)}) of your choice."

def process_numbered_response(response: str, options: List[str]) -> str:
    """Convert numbered response to actual option text"""
    try:
        choice_num = int(response.strip())
        if 1 <= choice_num <= len(options):
            return options[choice_num - 1]
        else:
            return response
    except ValueError:
        return response

def generate_final_prompt(conversation: List[Dict]) -> str:
    """Generate comprehensive business plan prompt using Gemini"""
    
    conversation_summary = "\n".join([
        f"{'User' if msg['role'] == 'user' else 'Assistant'}: {msg['content']}"
        for msg in conversation
    ])
    
    final_prompt = f"""You are a business planning expert. Based on the following consultation conversation, create a comprehensive business plan.

CONSULTATION CONVERSATION:
{conversation_summary}

Create a detailed business plan with these sections:

1. **EXECUTIVE SUMMARY**
   - Business concept overview
   - Target market and value proposition
   - Financial highlights and funding needs
   - Success factors

2. **BUSINESS DESCRIPTION & STRATEGY**
   - Detailed product/service description
   - Business model and revenue streams
   - Competitive advantages
   - Mission and objectives

3. **MARKET ANALYSIS**
   - Industry overview and trends
   - Target customer analysis
   - Market size and opportunity
   - Competitive landscape

4. **MARKETING & SALES PLAN**
   - Customer acquisition strategy
   - Marketing channels and budget
   - Sales process and pricing
   - Brand positioning

5. **OPERATIONS PLAN**
   - Day-to-day operations
   - Technology and equipment needs
   - Staffing requirements
   - Supply chain and logistics

6. **FINANCIAL PROJECTIONS**
   - Startup costs breakdown
   - Revenue projections (3-year)
   - Operating expenses
   - Break-even analysis
   - Funding requirements

7. **IMPLEMENTATION ROADMAP**
   - Launch timeline with milestones
   - First 90 days action plan
   - Success metrics and KPIs
   - Risk mitigation strategies

8. **APPENDICES**
   - Market research data
   - Financial assumptions
   - Legal requirements
   - Supporting documents

Make all recommendations specific and actionable based on the business discussed. Include realistic timelines, budgets, and practical next steps."""

    return final_prompt

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    global conversation_history, analyzer
    
    try:
        # Add user message to history
        user_message = {
            "role": "user",
            "content": request.message,
            "timestamp": datetime.now().isoformat()
        }
        conversation_history.append(user_message)
        
        # Initialize analyzer on first message
        if len(conversation_history) == 1:
            analyzer = StreamlinedBusinessAnalyzer()
            
            # Generate completely dynamic initial response
            initial_prompt = f"""You are a business consultant. A user wants to start this business: "{request.message}"

Generate an enthusiastic, encouraging response that:
1. Acknowledges their specific business idea positively (mention what you understand about it)
2. Shows genuine interest in their concept
3. Mentions you'll ask just a few essential questions to create their business plan
4. Explains they can respond with just numbers for quick answers
5. Keep it brief and professional
6. Be specific to their business idea, not generic

Generate only the response text, nothing else."""

            response = model.generate_content(initial_prompt)
            initial_response = response.text.strip()
            
            # Get first dynamic question
            question, options = analyzer.get_next_essential_question()
            analyzer.conversation_count += 1
            
            if question and options:
                full_response = f"{initial_response}\n\n{question}"
                
                response_message = {
                    "role": "assistant",
                    "content": full_response,
                    "timestamp": datetime.now().isoformat()
                }
                conversation_history.append(response_message)
                
                return ChatResponse(
                    response=question,
                    satisfied=False,
                    options=options
                )
        
        else:
            # Process the numbered response if previous message had options
            if len(conversation_history) >= 2:
                prev_assistant_msg = conversation_history[-2]
                if prev_assistant_msg.get("role") == "assistant":
                    # Try to extract options from previous response
                    prev_content = prev_assistant_msg.get("content", "")
                    if "1." in prev_content and "2." in prev_content:
                        # Extract options from previous message
                        lines = prev_content.split('\n')
                        options = []
                        for line in lines:
                            if line.strip().startswith(('1.', '2.', '3.', '4.', '5.', '6.')):
                                option = line.split('.', 1)[1].strip()
                                options.append(option)
                        
                        if options:
                            processed_response = process_numbered_response(request.message, options)
                            # Update the user message with the processed response
                            conversation_history[-1]["content"] = processed_response
            
            # Check if satisfied using dynamic analysis
            if analyzer.is_satisfied():
                final_prompt = generate_final_prompt(conversation_history)
                
                # Generate final response
                final_response_prompt = """Generate a brief congratulatory message that:
1. Thanks them for providing the essential information
2. Mentions their business plan is ready to be generated
3. Explains they can use the provided prompt with any AI assistant
Keep it encouraging and concise."""

                response = model.generate_content(final_response_prompt)
                final_response = response.text.strip()
                
                response_message = {
                    "role": "assistant", 
                    "content": final_response,
                    "timestamp": datetime.now().isoformat()
                }
                conversation_history.append(response_message)
                
                return ChatResponse(
                    response=final_response,
                    satisfied=True,
                    final_prompt=final_prompt
                )
            
            else:
                # Get next dynamic question
                question, options = analyzer.get_next_essential_question()
                analyzer.conversation_count += 1
                
                if question and options:
                    response_message = {
                        "role": "assistant",
                        "content": question,
                        "timestamp": datetime.now().isoformat()
                    }
                    conversation_history.append(response_message)
                    
                    return ChatResponse(
                        response=question,
                        satisfied=False,
                        options=options
                    )
                else:
                    # No fallback - throw error if question generation fails
                    raise HTTPException(status_code=500, detail="Failed to generate next question")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Streamlined Business Setup Chatbot API", "version": "2.0.0"}

@app.post("/reset")
async def reset_conversation():
    """Reset the conversation history"""
    global conversation_history, analyzer
    conversation_history = []
    analyzer = None
    return {"message": "Conversation reset successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)