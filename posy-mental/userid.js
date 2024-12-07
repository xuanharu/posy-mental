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

// CREATE CHAT HISTORY
async function createChatHistory(user_id, chat_history_name) {
    const url = `http://localhost:8000/chatbot/create-chat-history?user_id=${encodeURIComponent(user_id)}&chat_history_name=${encodeURIComponent(chat_history_name)}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            body: '' // Empty body, as in the curl command
        });

        if (response.status != 200) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); // Assuming the API returns JSON
        console.log('Chat history created successfully:', data);
        return data;
    } catch (error) {
        console.error('Error creating chat history:', error);
        throw error;
    }
}

const url = 'http://localhost:8000/chatbot/create-chat-history?user_id=e3d923d417caad1df66d0058&chat_history_name=Conversation%201';

// CHAT HISTORY BY USER_ID
function getChatHistory(userId) {
    const url = `http://localhost:8000/chatbot/chat-histories-by-user-id?user_id=${userId}`;

    fetch(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Chat History:', data);
        })
        .catch(error => {
            console.error('Error fetching chat history:', error);
        });
}

// SEND MESSAGE
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