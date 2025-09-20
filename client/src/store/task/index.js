import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  refinedPrompt:'geyhetewery',
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setRefinedPrompt :(state,action)=>{
        console.log(action);
        
        state.refinedPrompt = action.payload;
    }
  },
});

export const {  setRefinedPrompt } = chatSlice.actions;
export default chatSlice.reducer;
