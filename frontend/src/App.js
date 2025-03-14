import React, { useState, useEffect } from "react";

const API_URL = "https://fsra-chatbot-backend.onrender.com"; // Backend URL

function App() {
  // User Authentication States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);

  // Chatbot States
  const [query, setQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  // ✅ Load user and chat history from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);

      // Retrieve chat history for the logged-in user
      const savedChat = localStorage.getItem(`chatHistory_${userData.name}`);
      if (savedChat) {
        setChatHistory(JSON.parse(savedChat));
      }

      // ✅ Fetch pending requests if user is an FSRA role
      fetchPendingRequests(userData.role);
    }
  }, []);

  // ✅ Function to fetch pending requests (if FSRA role)
  const fetchPendingRequests = async (role) => {
    if (role.includes("FSRA")) {
      try {
        const response = await fetch(`${API_URL}/pending-requests`);
        const data = await response.json();
        setPendingRequests(data.requests || []);
      } catch (error) {
        console.error("Error fetching pending requests:", error.message);
      }
    }
  };

  // ✅ Function to handle user login
  const handleLogin = async () => {
    if (email && password) {
      try {
        const response = await fetch(`${API_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();

        if (data.name) {
          setUser(data);
          localStorage.setItem("user", JSON.stringify(data));

          // Fetch pending requests if applicable
          fetchPendingRequests(data.role);

          // Load chat history for the logged-in user
          const savedChat = localStorage.getItem(`chatHistory_${data.name}`);
          setChatHistory(savedChat ? JSON.parse(savedChat) : []);
        } else {
          alert("Invalid credentials. Please try again.");
        }
      } catch (error) {
        console.error("Login error:", error.message);
      }
    }
  };

  // ✅ Function to handle chatbot query
  const handleChatbotQuery = async () => {
    if (!query.trim()) return;

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });
      const data = await response.json();

      const newChat = [
        ...chatHistory,
        { user: "You", message: query },
        { user: "AI", message: data.reply },
      ];

      setChatHistory(newChat);

      // Store chat history specific to the logged-in user
      if (user?.name) {
        localStorage.setItem(`chatHistory_${user.name}`, JSON.stringify(newChat));
      }
    } catch (error) {
      console.error("AI Chatbot Error:", error.message);
    }
  };

  // ✅ Function to handle user logout
  const handleLogout = () => {
    if (user?.name) {
      localStorage.removeItem(`chatHistory_${user.name}`); // Clear chat for this user
    }
    localStorage.removeItem("user"); // Remove user session
    setUser(null);
    setChatHistory([]); // Clear chat UI
  };

  return (
    <div style={containerStyle}>
      {!user ? (
        <div style={loginContainerStyle}>
          <img src="/insura.svg" alt="Insura Logo" style={{ width: "650px", height: "auto", marginBottom: "75px" }} />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          <button onClick={handleLogin} style={buttonStyle}>Login</button>
        </div>
      ) : (
        <>
          <div style={headerStyle}>
            <img src="/insura.svg" alt="Insura Logo" style={{ width: "700px", height: "auto", marginBottom: "50px" }} />
            <p style={welcomeStyle}><strong>👋🏼 Welcome, {user.name}</strong></p>
            <p style={roleStyle}><strong>Role:</strong> {user.role}</p>
            <button onClick={handleLogout} style={buttonStyle}>Logout</button>
          </div>

          {user.role.includes("FSRA") && pendingRequests.length > 0 && (
            <div style={pendingRequestsStyle}>
              <h3>Pending Requests</h3>
              <ul>
                {pendingRequests.map((request, index) => (
                  <li key={index}>{request}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={chatbotContainerStyle}>
            <h3>AI Chatbot (FSRA Policy Assistant)</h3>
            <textarea
              placeholder="Hello! I'm Insura, how can I help you?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={textareaStyle}
            />
            <button onClick={handleChatbotQuery} style={buttonStyle}>Ask Insura</button>
            <div style={chatHistoryStyle}>
              {chatHistory.map((chat, index) => (
                <p key={index}><strong>{chat.user}:</strong> {chat.message}</p>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/** ✅ STYLING **/
const containerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  backgroundColor: "#f8f9fa",
  fontFamily: "Arial, sans-serif",
  gap: "12px", // 🔥 Space out elements evenly
};

const logoStyle = {
  width: "250px",
  marginBottom: "-20px"
};

const loginContainerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  backgroundColor: "#ffffff",
  padding: "40px",
  borderRadius: "8px",
  boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
  position: "relative",
  top: "-40px", // 🔥 Move the form higher
  width: "700px", // Increase form size
};



const inputStyle = {
  padding: "18px",  // 🔥 Bigger input fields
  width: "80%",    // Make it match the form width
  fontSize: "18px", // 🔥 Larger text inside the input fields
  borderRadius: "8px",
  border: "1px solid #ccc",
  marginBottom: "12px", // 🔥 Reduce space between email & password
};


const buttonStyle = {
  padding: "15px 25px",  // 🔥 Increase button size slightly
  backgroundColor: "#E85B2D",  // 🔥 Match Insura logo color
  color: "#fff",
  fontSize: "18px",  // 🔥 Bigger text for better readability
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  marginTop: "8px", // 🔥 Reduce space between password field & button
};


const headerStyle = {
  textAlign: "center",
  marginBottom: "10px", // 🔥 Reduce space below the logo
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "8px", // 🔥 Keeps spacing balanced
};

const pendingRequestsStyle = {
  backgroundColor: "#ffebcc",
  padding: "10px",
  borderRadius: "5px",
  marginBottom: "20px",
  textAlign: "center",
  boxShadow: "0px 2px 4px rgba(0,0,0,0.1)"
};

const chatbotContainerStyle = {
  width: "50%",
  backgroundColor: "#ffffff",
  padding: "20px",
  borderRadius: "8px",
  boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
  textAlign: "center"
};

const textareaStyle = {
  width: "100%",
  height: "80px",
  padding: "10px",
  borderRadius: "5px",
  border: "1px solid #ccc",
  marginBottom: "10px"
};

const chatHistoryStyle = {
  textAlign: "left",
  maxHeight: "200px",
  overflowY: "auto",
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "5px",
  marginTop: "10px"
};

// 🔥 Styles for Welcome and Role text
const welcomeStyle = {
  fontSize: "30px", // 🔥 Bigger welcome text
  fontWeight: "bold",
  marginTop: "-10px", // 🔥 Moves text closer to the logo
};

const roleStyle = {
  fontSize: "25px", // 🔥 Bigger role text
  fontWeight: "600",
};
export default App;
