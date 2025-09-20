import { CloudUpload } from 'lucide-react';
import React from 'react'
import { useSelector } from 'react-redux'

export default function Developer() {
  const {refinedPrompt} = useSelector((state)=>state.task);
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-gray-400">
      
      {
        refinedPrompt.length<=0 ? 
      <div className="text-center p-8 bg-gray-900 rounded-lg shadow-lg">
        <CloudUpload size={64} className="mx-auto text-cyan-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">No Project Initialized Yet</h1>
        <p className="text-md">Please upload a project to get started.</p>
      </div>
      :
      <div>
      {refinedPrompt}

      </div>
      }
    </div>
  )
}
