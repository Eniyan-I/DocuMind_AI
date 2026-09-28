from operator import itemgetter
from langchain_core.runnables import RunnableLambda
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
import os
from dotenv import load_dotenv
load_dotenv() 

os.environ["GOOGLE_API_KEY"] = os.getenv('GOOGLE_API_KEY')

def rag_res(retriever, question):
    if not retriever:
        return "Error: No retriever available. Please upload a valid PDF first."
    llm = ChatGoogleGenerativeAI(model='gemini-2.5-flash')
    
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

    # Use RunnableLambda to safely handle retriever and doc formatting in the chain map
    retrieve_docs = RunnableLambda(lambda x: retriever.invoke(x)) | format_docs

    rag_chain = (
        {
            'context': itemgetter('question') | retrieve_docs,
            'question': itemgetter('question')
        }
        | prompt
        | llm
        | StrOutputParser()
    )

    response = rag_chain.invoke({'question': question})
    return response