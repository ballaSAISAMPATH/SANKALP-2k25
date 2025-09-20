from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
import google.generativeai as genai
import os
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(title="Business Setup Chatbot", version="1.0.0")
origins = [
    "http://localhost:5173",  # React dev server
    "http://127.0.0.1:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # allows OPTIONS, GET, POST, etc.
    allow_headers=["*"],
)
# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
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
        # Only essential areas that can't be self-determined
        self.essential_areas = [
            "business_model",
            "target_market", 
            "revenue_model",
            "resources_budget",
            "timeline"
        ]
        
        self.covered_areas = set()
        self.business_type = None
        self.question_count = 0
        
    def analyze_business_type(self, initial_idea: str) -> str:
        """Dynamically identify business type from user's idea"""
        idea_lower = initial_idea.lower()
        
        if any(word in idea_lower for word in ["app", "platform", "website", "software", "tech", "digital"]):
            return "tech_digital"
        elif any(word in idea_lower for word in ["restaurant", "food", "cafe", "delivery", "catering"]):
            return "food_service"
        elif any(word in idea_lower for word in ["store", "shop", "retail", "sell products", "e-commerce"]):
            return "retail"
        elif any(word in idea_lower for word in ["service", "consulting", "freelance", "agency"]):
            return "service_based"
        elif any(word in idea_lower for word in ["education", "training", "teaching", "course", "coaching"]):
            return "education"
        else:
            return "general"
    
    def get_next_essential_question(self) -> tuple[Optional[str], Optional[List[str]]]:
        """Get the next essential question with numbered options"""
        
        if "business_model" not in self.covered_areas:
            self.covered_areas.add("business_model")
            return self.get_business_model_question()
            
        elif "target_market" not in self.covered_areas:
            self.covered_areas.add("target_market")
            return self.get_target_market_question()
            
        elif "revenue_model" not in self.covered_areas:
            self.covered_areas.add("revenue_model")
            return self.get_revenue_question()
            
        elif "resources_budget" not in self.covered_areas:
            self.covered_areas.add("resources_budget")
            return self.get_resources_question()
            
        elif "timeline" not in self.covered_areas:
            self.covered_areas.add("timeline")
            return self.get_timeline_question()
        
        return None, None
    
    def get_business_model_question(self) -> tuple[str, List[str]]:
        """Get business model question based on business type"""
        
        questions_and_options = {
            "tech_digital": (
                "How will customers access your solution?",
                [
                    "Mobile app only",
                    "Web platform only", 
                    "Both mobile and web",
                    "API/Service for businesses"
                ]
            ),
            "food_service": (
                "What's your service model?",
                [
                    "Dine-in restaurant",
                    "Delivery/takeout only",
                    "Food truck/mobile",
                    "Catering services",
                    "Mixed model"
                ]
            ),
            "retail": (
                "How will you sell your products?",
                [
                    "Physical store only",
                    "Online store only",
                    "Both physical and online",
                    "Marketplace (Amazon/eBay)",
                    "Wholesale to businesses"
                ]
            ),
            "service_based": (
                "How will you deliver your service?",
                [
                    "At client location",
                    "Remote/online only",
                    "At my office/location",
                    "Mixed approach"
                ]
            ),
            "education": (
                "What's your teaching format?",
                [
                    "Online courses",
                    "In-person classes",
                    "One-on-one tutoring",
                    "Group workshops",
                    "Mixed format"
                ]
            ),
            "general": (
                "What's your business model?",
                [
                    "Product sales",
                    "Service provision",
                    "Digital/online business",
                    "Subscription model",
                    "Marketplace/platform"
                ]
            )
        }
        
        return questions_and_options.get(self.business_type, questions_and_options["general"])
    
    def get_target_market_question(self) -> tuple[str, List[str]]:
        """Get target market question"""
        return (
            "Who is your primary target customer?",
            [
                "Individual consumers (B2C)",
                "Small businesses (1-50 employees)",
                "Medium businesses (50-500 employees)",
                "Large enterprises (500+ employees)",
                "Government/non-profit",
                "Mixed customer base"
            ]
        )
    
    def get_revenue_question(self) -> tuple[str, List[str]]:
        """Get revenue model question"""
        
        if self.business_type == "tech_digital":
            return (
                "How will you charge customers?",
                [
                    "Monthly subscription ($5-50/month)",
                    "Annual subscription (discount for yearly)",
                    "One-time purchase/license",
                    "Freemium (free + premium tiers)",
                    "Commission/transaction fees",
                    "Advertisement revenue"
                ]
            )
        else:
            return (
                "What's your pricing approach?",
                [
                    "Premium pricing (higher than competitors)",
                    "Competitive pricing (match market rates)",
                    "Value pricing (lower price, good value)",
                    "Subscription/recurring revenue",
                    "Project-based pricing",
                    "Commission/percentage based"
                ]
            )
    
    def get_resources_question(self) -> tuple[str, List[str]]:
        """Get resources/budget question"""
        return (
            "What's your startup budget range?",
            [
                "Under $1,000 (bootstrap/minimal)",
                "$1,000 - $10,000 (small investment)",
                "$10,000 - $50,000 (moderate investment)",
                "$50,000 - $200,000 (significant investment)",
                "$200,000+ (major investment/funding needed)",
                "I need to research and determine costs"
            ]
        )
    
    def get_timeline_question(self) -> tuple[str, List[str]]:
        """Get timeline question"""
        return (
            "When do you want to launch?",
            [
                "Within 1-3 months (quick launch)",
                "3-6 months (standard timeline)",
                "6-12 months (thorough preparation)",
                "1+ years (long-term planning)",
                "As soon as funding is secured",
                "When I have more skills/experience"
            ]
        )
    
    def is_satisfied(self) -> bool:
        """Check if all essential questions are covered"""
        return len(self.covered_areas) >= len(self.essential_areas)

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
            return response  # Fallback to original response
    except ValueError:
        return response  # Fallback if not a number

def generate_final_prompt(conversation: List[Dict]) -> str:
    """Generate comprehensive business plan prompt"""
    
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
        print(request.message)
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
            analyzer.business_type = analyzer.analyze_business_type(request.message)
            
            # Generate enthusiastic initial response
            gemini_prompt = f"""You are a business consultant. A user wants to start this business: "{request.message}"

Generate an enthusiastic, encouraging response that:
1. Acknowledges their business idea positively
2. Mentions you'll ask just a few essential questions to create their business plan
3. Explains they can respond with just numbers for quick answers
4. Keep it brief and professional

Business type detected: {analyzer.business_type}"""

            response = model.generate_content(gemini_prompt)
            initial_response = response.text
            
            # Get first question
            question, options = analyzer.get_next_essential_question()
            
            if question and options:
                full_response = f"{initial_response}\n\n{format_options_response(question, options)}"
                
                response_message = {
                    "role": "assistant",
                    "content": full_response,
                    "timestamp": datetime.now().isoformat()
                }
                conversation_history.append(response_message)
                
                return ChatResponse(
                    response=full_response,
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
            
            # Check if satisfied
            if analyzer.is_satisfied():
                final_prompt = generate_final_prompt(conversation_history)
                
                # Generate final response
                gemini_final_prompt = """Generate a brief congratulatory message that:
1. Thanks them for providing the essential information
2. Mentions their business plan is ready to be generated
3. Explains they can use the provided prompt with any AI assistant
Keep it encouraging and concise."""

                response = model.generate_content(gemini_final_prompt)
                final_response = response.text
                
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
                # Get next question
                question, options = analyzer.get_next_essential_question()
                
                if question and options:
                    formatted_question = format_options_response(question, options)
                    
                    response_message = {
                        "role": "assistant",
                        "content": formatted_question,
                        "timestamp": datetime.now().isoformat()
                    }
                    conversation_history.append(response_message)
                    
                    return ChatResponse(
                        response=formatted_question,
                        satisfied=False,
                        options=options
                    )
                else:
                    # This shouldn't happen but fallback
                    fallback_response = "Thank you for that information. Let me prepare your business plan now."
                    
                    response_message = {
                        "role": "assistant",
                        "content": fallback_response,
                        "timestamp": datetime.now().isoformat()
                    }
                    conversation_history.append(response_message)
                    
                    return ChatResponse(
                        response=fallback_response,
                        satisfied=True,
                        final_prompt=generate_final_prompt(conversation_history)
                    )
        
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