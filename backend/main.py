from rag import processing_pdf,rag_res
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import shutil

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
        "http://127.0.0.1:3000",],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post('/upload_pdf')
async def upload(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    try:
      with open(file_path, "wb") as buffer:
          shutil.copyfileobj(file.file, buffer)
      processing_pdf()
    except Exception as e:
      raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")
    return {"message": f"File '{file.filename}' processed successfully!"}

class QuestionModel(BaseModel):
    qn: str

@app.post('/chat')
async def chat(model: QuestionModel):
    qn = model.qn
    print(f"DEBUG: Received question -> '{qn}'")
    answer =await rag_res(qn)
    return {'answer': answer}
    
   
if __name__ == '__main__':
    uvicorn.run('main:app', host='127.0.0.1', port=8000, reload=True)
