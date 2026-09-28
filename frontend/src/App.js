import React, { useState } from 'react';
import './App.css'; // Optional styling

function App() {
  // File Upload States
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Chat States
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isAsking, setIsAsking] = useState(false);

  const API_BASE_URL = 'http://127.0.0.1:8000';

  // Handle File Selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle PDF Upload to FastAPI (/upload_pdf)
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadStatus('Please select a PDF file first.');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Processing PDF...');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${API_BASE_URL}/upload_pdf`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus(data.message || 'File processed successfully!');
      } else {
        setUploadStatus(data.error || 'Failed to process PDF.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('Error connecting to backend server.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Asking Question to FastAPI (/chat)
  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userQuestion = question;
    setQuestion('');

    // Add user question to history immediately
    setChatHistory((prev) => [...prev, { sender: 'user', text: userQuestion }]);
    setIsAsking(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qn: userQuestion }),
      });

      const data = await response.json();

      if (response.ok && data.answer) {
        setChatHistory((prev) => [
          ...prev,
          { sender: 'bot', text: data.answer },
        ]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          { sender: 'error', text: data.error || 'Failed to get answer.' },
        ]);
      }
    } catch (error) {
      console.error('Error asking question:', error);
      setChatHistory((prev) => [
        ...prev,
        { sender: 'error', text: 'Error connecting to backend server.' },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '40px auto', fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h2>RAG Document Assistant</h2>

      {/* Upload Section */}
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>1. Upload PDF</h3>
        <form onSubmit={handleUpload}>
          <input type="file" accept=".pdf" onChange={handleFileChange} />
          <button type="submit" disabled={isUploading || !selectedFile} style={{ marginLeft: '10px' }}>
            {isUploading ? 'Processing...' : 'Upload & Process'}
          </button>
        </form>
        {uploadStatus && <p style={{ marginTop: '10px', color: '#333' }}>{uploadStatus}</p>}
      </div>

      {/* Chat Section */}
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
        <h3>2. Ask Questions</h3>
        
        {/* Chat Output Window */}
        <div style={{ minHeight: '200px', maxHeight: '400px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', marginBottom: '15px', borderRadius: '4px', backgroundColor: '#f9f9f9' }}>
          {chatHistory.length === 0 ? (
            <p style={{ color: '#888' }}>Upload a PDF above and ask questions about it here.</p>
          ) : (
            chatHistory.map((msg, index) => (
              <div key={index} style={{ marginBottom: '10px', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '8px 12px',
                    borderRadius: '15px',
                    backgroundColor: msg.sender === 'user' ? '#007bff' : msg.sender === 'error' ? '#dc3545' : '#e9ecef',
                    color: msg.sender === 'user' || msg.sender === 'error' ? '#fff' : '#000',
                  }}
                >
                  {msg.text}
                </span>
              </div>
            ))
          )}
          {isAsking && <p style={{ color: '#888' }}>Thinking...</p>}
        </div>

        {/* Input Form */}
        <form onSubmit={handleAskQuestion} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Type your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            style={{ flex: 1, padding: '8px' }}
          />
          <button type="submit" disabled={isAsking || !question.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;