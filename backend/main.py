from data_ingestion import processing_pdf
from rag import rag_res
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import shutil
import os

app = FastAPI()

# Enable CORS so your React frontend (running on port 3000 or 5173) can talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable to store retriever/vectorstore instance
retrieve = None

# Ensure an uploads directory exists
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post('/upload_pdf')
async def upload(file: UploadFile = File(...)):
    global retrieve
    
    # Save the uploaded file locally so processing_pdf can read it
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Process the saved file
        retrieve = processing_pdf(file_path)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")
        
    return {"message": f"File '{file.filename}' processed successfully!"}

class QuestionModel(BaseModel):
    qn: str

@app.post('/chat')
def chat(model: QuestionModel):
    global retrieve
    print(retrieve)
    qn = model.qn
    print(f"DEBUG: Received question -> '{qn}'")
    if retrieve != '':
        answer = rag_res(retrieve, qn)
        return {'answer': answer}
        
    return {"error": "No PDF has been processed yet. Please upload a PDF first via /upload_pdf."}

if __name__ == '__main__':
    uvicorn.run('main:app', host='127.0.0.1', port=8000, reload=True)