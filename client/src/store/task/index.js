import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  refinedPrompt: 'geyhetewery',
  developerOutput: null,
  functionalOutput: null,
  nonFunctionalOutput: null,
  
  // Project Plan (Development)
  projectPlan: null,
  messages: [],
  
  // Functional Requirements
  functionalRequirements: null,
  functionalMessages: [],
  
  // Non-Functional Requirements (for future use)
  nonFunctionalRequirements: null,
  nonFunctionalMessages: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // Basic setters
    setRefinedPrompt: (state, action) => {
      console.log('Setting refined prompt:', action.payload);
      state.refinedPrompt = action.payload;
    },
    setDeveloperOutput: (state, action) => {
      console.log('Setting developer output:', action.payload);
      state.developerOutput = action.payload;
    },
    setFunctionalOutput: (state, action) => {
      console.log('Setting functional output:', action.payload);
      state.functionalOutput = action.payload;
    },
    setNonFunctionalOutput: (state, action) => {
      console.log('Setting non-functional output:', action.payload);
      state.nonFunctionalOutput = action.payload;
    },
    
    // Development (Project Plan) actions
    setProjectPlan: (state, action) => {
      console.log('Setting project plan:', action.payload);
      state.projectPlan = action.payload;
    },
    setMessages: (state, action) => {
      console.log('Setting messages:', action.payload);
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearProject: (state) => {
      state.projectPlan = null;
      state.messages = [];
      state.developerOutput = null;
    },
    
    // Functional Requirements actions
    setFunctionalRequirements: (state, action) => {
      console.log('Setting functional requirements:', action.payload);
      state.functionalRequirements = action.payload;
    },
    setFunctionalMessages: (state, action) => {
      console.log('Setting functional messages:', action.payload);
      state.functionalMessages = action.payload;
    },
    addFunctionalMessage: (state, action) => {
      state.functionalMessages.push(action.payload);
    },
    clearFunctional: (state) => {
      state.functionalRequirements = null;
      state.functionalMessages = [];
      state.functionalOutput = null;
    },
    
    // Non-Functional Requirements actions (for future use)
    setNonFunctionalRequirements: (state, action) => {
      console.log('Setting non-functional requirements:', action.payload);
      state.nonFunctionalRequirements = action.payload;
    },
    setNonFunctionalMessages: (state, action) => {
      console.log('Setting non-functional messages:', action.payload);
      state.nonFunctionalMessages = action.payload;
    },
    addNonFunctionalMessage: (state, action) => {
      state.nonFunctionalMessages.push(action.payload);
    },
    clearNonFunctional: (state) => {
      state.nonFunctionalRequirements = null;
      state.nonFunctionalMessages = [];
      state.nonFunctionalOutput = null;
    },
    
    // Global clear action
    clearAll: (state) => {
      state.projectPlan = null;
      state.messages = [];
      state.developerOutput = null;
      state.functionalRequirements = null;
      state.functionalMessages = [];
      state.functionalOutput = null;
      state.nonFunctionalRequirements = null;
      state.nonFunctionalMessages = [];
      state.nonFunctionalOutput = null;
    },
  },
});

export const {
  setRefinedPrompt,
  setDeveloperOutput,
  setFunctionalOutput,
  setNonFunctionalOutput,
  
  // Development actions
  setProjectPlan,
  setMessages,
  addMessage,
  clearProject,
  
  // Functional Requirements actions
  setFunctionalRequirements,
  setFunctionalMessages,
  addFunctionalMessage,
  clearFunctional,
  
  // Non-Functional Requirements actions
  setNonFunctionalRequirements,
  setNonFunctionalMessages,
  addNonFunctionalMessage,
  clearNonFunctional,
  
  // Global action
  clearAll,
} = chatSlice.actions;

export default chatSlice.reducer;