import { useState } from 'react';
import axios from 'axios';
import Spinner from './components/Spinner';

function App() {
  // Chat & View States
  const [activePdfUrl, setActivePdfUrl] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [query, setQuery] = useState('');

  // Upload States (Jo pehle miss ho gaye the)
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  // File select handle karna
  const handleFileChange = (event) => setSelectedFile(event.target.files[0]);

  // NAYA: Upload Function (Ab Vercel Env Variable use kar raha hai)
  const handleUpload = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setUploadMessage("Please select a PDF!");
      return;
    }

    setIsLoading(true);
    setUploadMessage("");

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', selectedFile.name);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/documents/upload/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadMessage("Document vectorized successfully!");
    } catch (error) {
      console.error("Upload Error:", error);
      setUploadMessage("Error uploading document. Check console.");
    } finally {
      setIsLoading(false);
    }
  };

  // Chat Function (Ye bhi ab Vercel Env Variable use kar raha hai)
  const handleSendMessage = async () => {
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    setChatMessages([...chatMessages, userMsg]);
    setQuery('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/chat/`, {
        query: userMsg.text
      });

      const aiResponse = response.data.answer;
      setChatMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);

      if (response.data.source_pdf_url) {
          setActivePdfUrl(response.data.source_pdf_url);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setChatMessages(prev => [...prev, { sender: 'ai', text: "Sorry, network connection error." }]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-900 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">GovVault Intelligence Dashboard</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT PANEL: Chat & Upload */}
        <div className="w-1/2 flex flex-col border-r border-gray-300 bg-white">
          <div className="p-4 bg-gray-100 border-b font-semibold text-gray-700">
            AI Assistant
          </div>

          {/* UPLOAD SECTION INTEGRATED HERE */}
          <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
            <form onSubmit={handleUpload} className="flex gap-2 items-center">
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileChange} 
                  className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className={`px-4 py-2 rounded font-bold transition flex justify-center items-center ${
                    isLoading ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isLoading ? <><Spinner /> Uploading...</> : 'Upload'}
                </button>
            </form>
            {uploadMessage && <p className="text-xs text-gray-500 mt-2 font-medium">{uploadMessage}</p>}
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            {chatMessages.length === 0 ? (
                <p className="text-gray-500 italic">Welcome! Upload a document to start asking questions.</p>
            ) : (
                chatMessages.map((msg, index) => (
                    <div key={index} className={`mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                        <span className={`inline-block p-2 rounded-lg ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            {msg.text}
                        </span>
                    </div>
                ))
            )}
          </div>

          <div className="p-4 border-t bg-gray-50 flex gap-2">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder="Ask a question about the policies..." 
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleSendMessage}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-semibold"
            >
              Send
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: PDF Viewer */}
        <div className="w-1/2 bg-gray-200 flex flex-col">
          <div className="p-4 bg-gray-100 border-b font-semibold text-gray-700">
            Document Viewer
          </div>
          <div className="flex-1 p-4">
            {activePdfUrl ? (
              <iframe 
                src={activePdfUrl} 
                className="w-full h-full rounded shadow-sm border border-gray-300"
                title="Document Viewer"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No document selected. Click a citation to view the source.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;