import { useState } from 'react';
import './App.css'

function App(){
  const [SelectedFile,setSelectedFile]=useState('');
  const [Chat,setChat]=useState(false)
  const [Question,setQuestion]=useState('')
  const [messages, setMessages] = useState([]);
  const [think,setthink]=useState('')
  const [Loading,setLoading]=useState(false)

  const handleFileChange = (e) => {
  if (e.target.files && e.target.files[0]) {
    setSelectedFile(e.target.files[0]);
    console.log(SelectedFile);
  }
  };
  const handleclick=async(e)=>{
    if (!SelectedFile){
      alert('please upload a pdf')
      return
    }
    setLoading(true)
    const formData = new FormData();
    formData.append('file',SelectedFile);
    try{
      const response=await fetch('http://127.0.0.1:8000/upload_pdf',{
        method:'POST',
        body:formData
      })
      console.log('waiting for response')
      const res=await response.json();
      setLoading(false)
      setChat(true)
      console.log(res);
    }catch(error){
      console.error(error)
    }
  }
  const handlechange=(e)=>{
    setQuestion(e.target.value)
  }
  const handlesubmit = async(e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setthink('...')
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'user', text: Question }
      ]);
      try{
      const response=await fetch('http://127.0.0.1:8000/chat',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({qn:Question})
      })
      const res=await response.json();
      console.log(res.answer);
      setthink('')
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'ai', text: res.answer }
      ]);
      setQuestion('');
    }catch(error){
      console.error(error)
    }
    }
  };

  return(
    <>
    <h4 style={{margin:'5px',color:'white'}}>DocuMind AI</h4>
    <p style={{fontWeight:'lighter',fontSize:'small',marginTop:'-10px'}}>A RAG pipeline that retrieves relevant information from given knowledge base</p>
      {!Chat &&
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',marginTop:'100px'}}>
        <h3 style={{color:'white'}}>Upload PDF</h3>
        <div className="file_input">
          <label htmlFor='for_input' style={{width:'500px',height:'250px',  display: 'flex',alignItems: 'center',justifyContent: 'center',cursor:'pointer'}}>Drop your files here</label>
          <input id='for_input' style={{display:'none'}} type="file" accept=".pdf" onChange={handleFileChange}></input>
        </div>
        {Loading==false?<button className='submit-btn' onClick={handleclick}>submit</button>:<p style={{marginTop:'20px',color:'white',fontWeight:'lighter'}}>Processing...</p>}
      </div>}
      {Chat&&
      <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
        <div className='output'>
        {messages.map((msg, index) => (
          <div key={index} className={msg.sender === 'user' ? 'user-msg' : 'ai-msg'} >
          <span >
            {msg.text}<br></br><br></br>
          </span>
          </div>
        ))}
        <div>{think}</div>
      </div>
        <input className='txt_input' type='text' value={Question} placeholder='Enter your questtions' onChange={handlechange} onKeyDown={handlesubmit}></input>
      </div>}
    </>
  )
}

export default App;
