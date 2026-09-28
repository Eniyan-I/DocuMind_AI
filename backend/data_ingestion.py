from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import os
from dotenv import load_dotenv
load_dotenv() 

os.environ["GOOGLE_API_KEY"] = os.getenv('GOOGLE_API_KEY')

def processing_pdf(file_path):
  loader=PyPDFLoader(file_path)
  document=loader.load()

  splitter=RecursiveCharacterTextSplitter(chunk_size=500,chunk_overlap=200)
  split_doc=splitter.split_documents(document)

  embeddings=GoogleGenerativeAIEmbeddings(model='gemini-embedding-2-preview')

  db=FAISS.from_documents(split_doc,embeddings)
  retriever=db.as_retriever()

  return retriever