// Store the current chat history ID
let currentChatHistoryId = null;

// Load chat histories when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadChatHistories();
    setupEventListeners();
});

// Load chat histories from API
async function loadChatHistories() {
    try {
        const histories = await getChatHistoriesByUserId(getUserId());
        const chatList = document.getElementById('chatList');
        chatList.innerHTML = ''; // Clear existing items

        histories.forEach(history => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item';
            chatItem.dataset.id = history._id;
            chatItem.textContent = history.name;
            chatItem.onclick = () => loadChatHistory(history._id);
            chatList.appendChild(chatItem);
        });
    } catch (error) {
        console.error('Error loading chat histories:', error);
    }
}

// Load specific chat history
async function loadChatHistory(chatHistoryId) {
    try {
        const history = await getChatHistoryById(chatHistoryId);
        currentChatHistoryId = chatHistoryId;

        // Update active chat item
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.id === chatHistoryId) {
                item.classList.add('active');
            }
        });

        // Display messages
        const messagesContainer = document.getElementById('messages');
        messagesContainer.innerHTML = '';

        history.messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${message.role}`;
            messageDiv.innerHTML = `
                <div class="message-content">${message.content}</div>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            `;
            messagesContainer.appendChild(messageDiv);
        });

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
        console.error('Error loading chat history:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // New chat button
    document.getElementById('newChatBtn').onclick = async() => {
        const name = prompt('Enter conversation name:');
        if (name) {
            try {
                const result = await createChatHistory(getUserId(), name);
                if (result.chat_history_id) {
                    await loadChatHistories();
                    loadChatHistory(result.chat_history_id);
                }
            } catch (error) {
                console.error('Error creating chat:', error);
            }
        }
    };

    // Send message
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');

    async function sendMessage() {
        if (!currentChatHistoryId) {
            alert('Please select or create a conversation first');
            return;
        }

        const message = messageInput.value.trim();
        if (!message) return;

        try {
            // Disable input and button
            messageInput.disabled = true;
            sendBtn.disabled = true;

            // Add loading bubble
            const messagesContainer = document.getElementById('messages');
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'message assistant';
            loadingDiv.innerHTML = `
                <div class="message-content loading">
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                </div>
            `;
            messagesContainer.appendChild(loadingDiv);

            // Send message to API
            const response = await sendChatMessage(currentChatHistoryId, message);

            // Remove loading bubble and add both messages
            messagesContainer.removeChild(loadingDiv);

            // Add user message
            const userMessageDiv = document.createElement('div');
            userMessageDiv.className = 'message user';
            userMessageDiv.innerHTML = `
                <div class="message-content">${message}</div>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            `;
            messagesContainer.appendChild(userMessageDiv);

            // Add AI response
            const aiMessageDiv = document.createElement('div');
            aiMessageDiv.className = 'message assistant';
            aiMessageDiv.innerHTML = `
                <div class="message-content">${response.assistant_response}</div>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            `;
            messagesContainer.appendChild(aiMessageDiv);

            // Clear input and re-enable
            messageInput.value = '';
            messageInput.disabled = false;
            sendBtn.disabled = false;
            messageInput.focus();

            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } catch (error) {
            console.error('Error sending message:', error);
            messageInput.disabled = false;
            sendBtn.disabled = false;
        }
    }

    sendBtn.onclick = sendMessage;
    messageInput.onkeypress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };
}