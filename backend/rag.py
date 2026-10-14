from operator import itemgetter
from langchain_core.runnables import RunnableLambda
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
import os
from dotenv import load_dotenv
from jev_reranker import JevReranker

load_dotenv()
JEV_THRESHOLD = float(os.getenv("JEV_THRESHOLD", "0.20"))
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
TYPESAFE_API_KEY = os.getenv("TYPESAFE_API_KEY")

jev = JevReranker(api_key=TYPESAFE_API_KEY)
retriever=None

def processing_pdf():
  global retriever
  loader=PyPDFDirectoryLoader('uploads')
  document=loader.load()
  
  splitter=RecursiveCharacterTextSplitter(chunk_size=500,chunk_overlap=200)
  split_doc=splitter.split_documents(document)

  embeddings=GoogleGenerativeAIEmbeddings(model='gemini-embedding-2-preview',
            api_key=GOOGLE_API_KEY)
  
  db=FAISS.from_documents(split_doc,embeddings)
  retriever=db.as_retriever(search_kwargs={'k':10})
  return retriever

async def rag_res(question):
  global retriever
  if retriever is None:
    processing_pdf()
  
  docs = retriever.invoke(question)
  if not docs:
    return "No relevant documents were found."

  jev_response = await jev.a_relevance_rerank(
    query=question,
    documents=[doc.page_content for doc in docs],
    threshold=JEV_THRESHOLD,
    top_k=5,
    )
  selected_docs = []

  for item in jev_response["results"]:
    index = item["document_index"]
    original_doc = docs[index]
    selected_docs.append(
        original_doc.model_copy(
            update={
                "metadata": {
                    **original_doc.metadata,
                    "jev_score": item["score"],
                }
            }
        )
    )

  context_parts = []

  for i, doc in enumerate(selected_docs, start=1):
    source = doc.metadata.get("source", "unknown")
    page = doc.metadata.get("page", "unknown")
    context_parts.append(
        f"[Source {i}: {source}, page {page}]\n"
        f"{doc.page_content}"
    )

  context = "\n\n".join(context_parts)

  llm = ChatGoogleGenerativeAI(model='gemini-3.5-flash-lite',
            api_key=GOOGLE_API_KEY)
  
  prompt = ChatPromptTemplate.from_messages([
      (
          "system",
          """Provide answers only based on the context.
            <context>
            {context}
            </context>
            Question: {question}"""
      )
  ])

  def format_docs(docs):
      return '\n\n'.join(doc.page_content for doc in docs)

  rag_chain = prompt | llm | StrOutputParser()

  response =await rag_chain.ainvoke({'context':context,'question': question})
  return response
