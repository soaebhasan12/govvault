import { useState } from 'react';
import axios from 'axios';
import Spinner from './components/Spinner';

function App() {
  // Yeh wo states hain jo humne "Lift Up" ki hain
  const [activePdfUrl, setActivePdfUrl] = useState(null); // Right screen ke liye
  const [chatMessages, setChatMessages] = useState([]); // Left screen ke liye
  const [query, setQuery] = useState('');

  // YEH FUNCTION MISSING THA - Ab ye yahan component ke andar define ho gaya hai
  // Location: App.jsx ke andar
  const handleSendMessage = async () => {
    if (!query.trim()) return;

    // 1. User message update
    const userMsg = { sender: 'user', text: query };
    setChatMessages([...chatMessages, userMsg]);
    setQuery(''); // Clear input

    try {
      // 2. Waiter (Axios) ko POST request ke sath bheja
      const response = await axios.post('http://localhost:8000/api/chat/', {
        query: userMsg.text
      });

      // 3. AI ka jawab screen par dikhao
      const aiResponse = response.data.answer;
      setChatMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);

      // 4. Split-Screen Magic: PDF Viewer me source document kholo!
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
      
      {/* Top Navbar */}
      <header className="bg-blue-900 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold">GovVault Intelligence Dashboard</h1>
      </header>

      {/* Main Split Screen Container */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* LEFT PANEL: Chat Interface (50% width) */}
        <div className="w-1/2 flex flex-col border-r border-gray-300 bg-white">
          <div className="p-4 bg-gray-100 border-b font-semibold text-gray-700">
            AI Assistant
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            {/* YEH HISA UPDATE HUA HAI - Chat messages map karne ke liye */}
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
              value={query} // Input ab React State se controlled hai
              onChange={(e) => setQuery(e.target.value)} // Har keystroke par state update
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
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

        {/* RIGHT PANEL: PDF Viewer (50% width) */}
        <div className="w-1/2 bg-gray-200 flex flex-col">
          <div className="p-4 bg-gray-100 border-b font-semibold text-gray-700">
            Document Viewer
          </div>
          
          <div className="flex-1 p-4">
            {/* Ternary Operator in Action */}
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