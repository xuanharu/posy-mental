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

            // Add user message
            const messagesContainer = document.getElementById('messages');
            const userMessageDiv = document.createElement('div');
            userMessageDiv.className = 'message user';
            userMessageDiv.innerHTML = `
                <div class="message-content">${message}</div>
                <div class="message-time">${new Date().toLocaleTimeString()}</div>
            `;
            messagesContainer.appendChild(userMessageDiv);

            // Check if assessment mode is active
            if (typeof isAssessmentMode !== 'undefined' && isAssessmentMode) {
                // Start mental health assessment
                await startMentalHealthAssessment(messagesContainer, message);
            } else if (isAdviceRequest(message)) {
                // Show questionnaire (existing functionality)
                await showAdviceQuestionnaire(messagesContainer);
            } else {
                // Add loading bubble
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

                // Remove loading bubble
                messagesContainer.removeChild(loadingDiv);

                // Add AI response
                const aiMessageDiv = document.createElement('div');
                aiMessageDiv.className = 'message assistant';
                aiMessageDiv.innerHTML = `
                    <div class="message-content">${response.assistant_response}</div>
                    <div class="message-time">${new Date().toLocaleTimeString()}</div>
                `;
                messagesContainer.appendChild(aiMessageDiv);
            }

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

// Check if the message is asking for advice
function isAdviceRequest(message) {
    const adviceKeywords = [
        'advice', 'help me', 'need help', 'suggest', 'recommendation', 'what should i do',
        'how can i', 'how do i', 'how to', 'what to do', 'give me advice', 'advise me',
        'mental health advice', 'mental advice', 'advice for', 'help with', 'struggling with'
    ];

    const lowerMessage = message.toLowerCase();
    return adviceKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Show advice questionnaire
async function showAdviceQuestionnaire(messagesContainer) {
    // Create questionnaire container
    const questionnaireDiv = document.createElement('div');
    questionnaireDiv.className = 'message assistant';
    questionnaireDiv.innerHTML = `
        <div class="message-content">
            <h4>Mental Health Assessment</h4>
            <p>To provide personalized advice, I need to understand your situation better. Please select the symptoms you're experiencing:</p>
            <div class="symptoms-container" id="chatSymptomsContainer"></div>
            <button class="nav-btn" id="chatGenerateBtn" style="display: none; margin-top: 15px;">Continue</button>
        </div>
        <div class="message-time">${new Date().toLocaleTimeString()}</div>
    `;
    messagesContainer.appendChild(questionnaireDiv);

    // Add symptoms
    const symptoms = [
        "Anxiety",
        "Depression",
        "Sleep Issues",
        "Stress",
        "Mood Swings",
        "Social Withdrawal",
        "Concentration Problems",
        "Fatigue",
        "Loss of Interest",
        "Irritability"
    ];

    const symptomsContainer = questionnaireDiv.querySelector('#chatSymptomsContainer');
    symptomsContainer.innerHTML = symptoms.map(symptom => `
        <span class="symptom-tag" data-symptom="${symptom}">${symptom}</span>
    `).join('');

    // Add styles for the questionnaire
    addQuestionnaireStyles();

    // Add event listeners for symptoms
    const selectedSymptoms = [];
    const symptomTags = symptomsContainer.querySelectorAll('.symptom-tag');
    const generateBtn = questionnaireDiv.querySelector('#chatGenerateBtn');

    symptomTags.forEach(tag => {
        tag.addEventListener('click', () => {
            tag.classList.toggle('selected');
            const symptom = tag.dataset.symptom;

            if (tag.classList.contains('selected')) {
                selectedSymptoms.push(symptom);
            } else {
                const index = selectedSymptoms.indexOf(symptom);
                if (index !== -1) {
                    selectedSymptoms.splice(index, 1);
                }
            }

            // Show/hide generate button
            if (selectedSymptoms.length > 0) {
                generateBtn.style.display = 'inline-block';
            } else {
                generateBtn.style.display = 'none';
            }
        });
    });

    // Wait for user to select symptoms and click generate button
    return new Promise(resolve => {
        generateBtn.addEventListener('click', async() => {
            // Fetch questions for selected symptoms
            try {
                const response = await fetch('http://localhost:8000/mental-health/get_questions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ symptoms: selectedSymptoms })
                });

                if (!response.ok) {
                    throw new Error(`Server error: ${response.status}`);
                }

                const data = await response.json();
                if (!data.questions || !Array.isArray(data.questions)) {
                    throw new Error('Invalid response format: missing questions array');
                }

                // Show questions one by one
                const userAnswers = {};
                for (let i = 0; i < data.questions.length; i++) {
                    const question = data.questions[i];
                    const answer = await showQuestion(messagesContainer, question);
                    userAnswers[question.question] = answer;
                }

                // Generate advice
                await generateAdvice(messagesContainer, selectedSymptoms, userAnswers);
                resolve();
            } catch (error) {
                console.error('Error fetching questions:', error);
                const errorDiv = document.createElement('div');
                errorDiv.className = 'message assistant';
                errorDiv.innerHTML = `
                    <div class="message-content">
                        <p>I'm sorry, there was an error processing your request. Please try again later.</p>
                    </div>
                    <div class="message-time">${new Date().toLocaleTimeString()}</div>
                `;
                messagesContainer.appendChild(errorDiv);
                resolve();
            }
        });
    });
}

// Show a single question
async function showQuestion(messagesContainer, question) {
    // Create question container
    const questionDiv = document.createElement('div');
    questionDiv.className = 'message assistant';
    questionDiv.innerHTML = `
        <div class="message-content">
            <div class="symptom-context mb-3">
                <span class="badge bg-primary">${question.symptom}</span>
            </div>
            <div class="question-text">
                ${question.question}
            </div>
            <div class="options-container">
                ${question.options.map(option => `
                    <button class="option-btn" data-option="${option}">${option}</button>
                `).join('')}
            </div>
        </div>
        <div class="message-time">${new Date().toLocaleTimeString()}</div>
    `;
    messagesContainer.appendChild(questionDiv);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Wait for user to select an option
    return new Promise(resolve => {
        const optionBtns = questionDiv.querySelectorAll('.option-btn');
        optionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Highlight selected option
                optionBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');

                // Add user's answer as a message
                const answerDiv = document.createElement('div');
                answerDiv.className = 'message user';
                answerDiv.innerHTML = `
                    <div class="message-content">${btn.dataset.option}</div>
                    <div class="message-time">${new Date().toLocaleTimeString()}</div>
                `;
                messagesContainer.appendChild(answerDiv);

                // Scroll to bottom
                messagesContainer.scrollTop = messagesContainer.scrollHeight;

                // Resolve with the selected option
                setTimeout(() => {
                    resolve(btn.dataset.option);
                }, 500);
            });
        });
    });
}

// Generate advice based on symptoms and answers
async function generateAdvice(messagesContainer, selectedSymptoms, userAnswers) {
    // Add loading message
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

    try {
        // Create a summary of the user's symptoms and answers
        let adviceRequest = "I need advice based on the following assessment:\n\n";
        adviceRequest += "Symptoms: " + selectedSymptoms.join(", ") + "\n\n";
        adviceRequest += "My answers to the assessment questions:\n";
        
        for (const [question, answer] of Object.entries(userAnswers)) {
            adviceRequest += `Q: ${question}\nA: ${answer}\n\n`;
        }
        
        adviceRequest += "Please provide a comprehensive mental health assessment and advice based on this information.";

        // Use the chatbot API to generate advice based on the chat history
        const response = await sendChatMessage(currentChatHistoryId, adviceRequest);

        // Remove loading message
        messagesContainer.removeChild(loadingDiv);

        // Display advice
        const adviceDiv = document.createElement('div');
        adviceDiv.className = 'message assistant';
        adviceDiv.innerHTML = `
            <div class="message-content">
                <h4>Your Personalized Mental Health Advice</h4>
                <div class="advice-content">
                    ${response.assistant_response}
                </div>
            </div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `;
        messagesContainer.appendChild(adviceDiv);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
        console.error('Error generating advice:', error);
        
        // Remove loading message
        messagesContainer.removeChild(loadingDiv);
        
        // Show error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message assistant';
        errorDiv.innerHTML = `
            <div class="message-content">
                <p>I'm sorry, there was an error generating advice. Please try again later.</p>
            </div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `;
        messagesContainer.appendChild(errorDiv);
    }
}

// Add styles for the questionnaire
function addQuestionnaireStyles() {
    if (document.getElementById('questionnaire-styles')) return;

    const styleElement = document.createElement('style');
    styleElement.id = 'questionnaire-styles';
    styleElement.textContent = `
        .symptoms-container {
            margin: 15px 0;
        }
        
        .symptom-tag {
            display: inline-block;
            padding: 8px 15px;
            margin: 5px;
            background: #fff;
            border: 2px solid #1A76D1;
            border-radius: 20px;
            color: #1A76D1;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .symptom-tag.selected {
            background: #1A76D1;
            color: #fff;
        }
        
        .nav-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            background: #1A76D1;
            color: #fff;
            transition: all 0.3s ease;
            font-weight: 500;
        }
        
        .nav-btn:hover {
            background: #1557a0;
        }
        
        .options-container {
            margin-top: 15px;
        }
        
        .option-btn {
            display: block;
            width: 100%;
            padding: 10px;
            margin: 8px 0;
            border: 2px solid #eee;
            border-radius: 5px;
            background: #fff;
            text-align: left;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .option-btn:hover {
            border-color: #1A76D1;
            background: #f8f9fa;
        }
        
        .option-btn.selected {
            border-color: #1A76D1;
            background: #e3f2fd;
        }
        
        .badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 600;
        }
        
        .bg-primary {
            background-color: #1A76D1;
            color: white;
        }
        
        .mb-3 {
            margin-bottom: 15px;
        }
        
        .advice-section, .advice-content {
            margin-bottom: 15px;
            padding: 10px;
            border-radius: 5px;
            background: #f8f9fa;
        }
        
        .advice-section h5 {
            margin-top: 0;
            color: #1A76D1;
        }
        
        .professional-help {
            background: #e3f2fd;
            border-left: 4px solid #1A76D1;
        }
        
        .advice-content {
            line-height: 1.6;
        }
        
        .advice-content p {
            margin-bottom: 10px;
        }
        
        .advice-content h5 {
            color: #1A76D1;
            margin-top: 15px;
            margin-bottom: 5px;
        }
        
        .advice-content ul {
            padding-left: 20px;
        }
    `;
    document.head.appendChild(styleElement);
}