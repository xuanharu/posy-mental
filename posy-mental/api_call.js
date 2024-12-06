// How to define a function that makes an API call to get chat histories by user ID
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

// Example usage
const userId = 'e3d923d417caad1df66d0058';

getChatHistoriesByUserId(userId)
    .then(chatHistories => {
        console.log('Chat histories:', chatHistories);
        // Process the chat histories here
    })
    .catch(error => {
        console.error('Failed to get chat histories:', error);
    });