function generateHexId() {
    const hexCharacters = '0123456789abcdef';
    let hexId = '';
    for (let i = 0; i < 24; i++) {
        hexId += hexCharacters.charAt(Math.floor(Math.random() * 16));
    }
    return hexId;
}

function getUserId() {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
        console.log("user already have id")
        return storedUserId; // Return the stored user_id if it exists
    } else {
        const newUserId = generateHexId(); // Generate a new user_id
        localStorage.setItem('user_id', newUserId); // Store the new user_id in local storage
        console.log("create new id")
        return newUserId; // Return the newly generated user_id
    }
}

const user_id = getUserId()

// Get chat histories by user ID
async function getChatHistoriesByUserId(userId) {
    const apiUrl = `http://localhost:8000/chatbot/chat-histories-by-user-id?user_id=${userId}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching chat histories:', error);
        throw error;
    }
}

// Create chat history
async function createChatHistory(userId, chatHistoryName) {
    const apiUrl = `http://localhost:8000/chatbot/create-chat-history?user_id=${encodeURIComponent(userId)}&chat_history_name=${encodeURIComponent(chatHistoryName)}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'accept': 'application/json'
            },
            // The body is empty as per your curl command
            body: ''
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating chat history:', error);
        throw error;
    }
}

// Get chat history by ID
async function getChatHistoryById(chatHistoryId) {
    const apiUrl = `http://localhost:8000/chatbot/chat-history-by-id?chat_history_id=${encodeURIComponent(chatHistoryId)}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching chat history:', error);
        throw error;
    }
}

// Send chat message
async function sendChatMessage(chatHistoryId, newMessage) {
    const apiUrl = `http://localhost:8000/chatbot/chat?chat_history_id=${encodeURIComponent(chatHistoryId)}&new_message=${encodeURIComponent(newMessage)}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'accept': 'application/json'
            },
            // The body is empty as per your curl command
            body: ''
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error sending chat message:', error);
        throw error;
    }
}