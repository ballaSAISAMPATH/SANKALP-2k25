import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  refinedPrompt:'erethg',
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
