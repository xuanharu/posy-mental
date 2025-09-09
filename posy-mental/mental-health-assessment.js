// Mental Health Assessment Mode
let isAssessmentMode = false;
let assessmentQuestions = [];
let currentQuestionIndex = 0;
let userResponses = [];

// Sample mental health assessment questions
const mentalHealthQuestions = [{
        question: "Over the past two weeks, how often have you been bothered by feeling down, depressed, or hopeless?",
        options: [
            "Not at all",
            "Several days",
            "More than half the days",
            "Nearly every day"
        ]
    },
    {
        question: "Over the past two weeks, how often have you had little interest or pleasure in doing things?",
        options: [
            "Not at all",
            "Several days",
            "More than half the days",
            "Nearly every day"
        ]
    },
    {
        question: "How would you rate your overall stress level in the past week?",
        options: [
            "Very low stress",
            "Low stress",
            "Moderate stress",
            "High stress",
            "Very high stress"
        ]
    },
    {
        question: "How well have you been sleeping lately?",
        options: [
            "Very well - getting enough restful sleep",
            "Fairly well - minor sleep issues",
            "Poorly - frequent sleep problems",
            "Very poorly - severe sleep difficulties"
        ]
    },
    {
        question: "How often do you feel anxious or worried?",
        options: [
            "Rarely or never",
            "Sometimes",
            "Often",
            "Most of the time",
            "Constantly"
        ]
    },
    {
        question: "How satisfied are you with your social relationships?",
        options: [
            "Very satisfied",
            "Somewhat satisfied",
            "Neutral",
            "Somewhat dissatisfied",
            "Very dissatisfied"
        ]
    },
    {
        question: "How well are you able to concentrate on tasks or activities?",
        options: [
            "Very well - no problems concentrating",
            "Fairly well - minor concentration issues",
            "Poorly - frequent concentration problems",
            "Very poorly - severe concentration difficulties"
        ]
    },
    {
        question: "How often do you engage in activities you enjoy?",
        options: [
            "Daily",
            "Several times a week",
            "Once a week",
            "Rarely",
            "Never"
        ]
    }
];

// Toggle assessment mode
function toggleAssessmentMode() {
    isAssessmentMode = !isAssessmentMode;
    const assessmentBtn = document.getElementById('assessmentModeBtn');
    const messagesContainer = document.getElementById('messages');

    if (isAssessmentMode) {
        assessmentBtn.textContent = 'Exit Assessment Mode';
        assessmentBtn.classList.add('active');

        // Show assessment mode notification
        const notificationDiv = document.createElement('div');
        notificationDiv.className = 'message assistant assessment-notification';
        notificationDiv.innerHTML = `
            <div class="message-content">
                <h4>🧠 Mental Health Assessment Mode Activated</h4>
                <p>I'm now in assessment mode. After you send me a message, I'll respond with a mental health questionnaire to better understand your current state and provide personalized support.</p>
                <p><strong>Note:</strong> Your responses will be stored in the chat history for reference.</p>
            </div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `;
        messagesContainer.appendChild(notificationDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } else {
        assessmentBtn.textContent = 'Mental Health Assessment';
        assessmentBtn.classList.remove('active');

        // Reset assessment state
        currentQuestionIndex = 0;
        userResponses = [];

        // Show exit notification
        const notificationDiv = document.createElement('div');
        notificationDiv.className = 'message assistant';
        notificationDiv.innerHTML = `
            <div class="message-content">
                <p>Assessment mode deactivated. I'm back to normal chat mode.</p>
            </div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `;
        messagesContainer.appendChild(notificationDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Generate random subset of questions (3-8 questions)
function generateAssessmentQuestions() {
    const numQuestions = Math.floor(Math.random() * 6) + 3; // 3 to 8 questions
    const shuffled = [...mentalHealthQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numQuestions);
}

// Start mental health assessment
async function startMentalHealthAssessment(messagesContainer, originalMessage) {
    // Generate questions for this assessment
    assessmentQuestions = generateAssessmentQuestions();
    currentQuestionIndex = 0;
    userResponses = [];

    // First, get AI response to the original message
    try {
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
        const response = await sendChatMessage(currentChatHistoryId, originalMessage);

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

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Wait a moment, then start assessment
        setTimeout(() => {
            showAssessmentIntro(messagesContainer);
        }, 1000);

    } catch (error) {
        console.error('Error getting AI response:', error);
        // Still proceed with assessment even if AI response fails
        showAssessmentIntro(messagesContainer);
    }
}

// Show assessment introduction
function showAssessmentIntro(messagesContainer) {
    const introDiv = document.createElement('div');
    introDiv.className = 'message assistant assessment-intro';
    introDiv.innerHTML = `
        <div class="message-content">
            <h4>📋 Mental Health Assessment</h4>
            <p>To provide you with more personalized support, I'd like to ask you a few questions about your current mental health status.</p>
            <p>This assessment will take about 2-3 minutes and consists of ${assessmentQuestions.length} multiple-choice questions.</p>
            <p><strong>Your privacy is important:</strong> Your responses will only be used to better understand your needs and provide appropriate support.</p>
            <button class="assessment-start-btn" onclick="startQuestionSequence()">Start Assessment</button>
        </div>
        <div class="message-time">${new Date().toLocaleTimeString()}</div>
    `;
    messagesContainer.appendChild(introDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Start the question sequence
function startQuestionSequence() {
    const messagesContainer = document.getElementById('messages');
    showNextQuestion(messagesContainer);
}

// Show next question in the assessment
function showNextQuestion(messagesContainer) {
    if (currentQuestionIndex >= assessmentQuestions.length) {
        // Assessment complete
        completeAssessment(messagesContainer);
        return;
    }

    const question = assessmentQuestions[currentQuestionIndex];
    const questionDiv = document.createElement('div');
    questionDiv.className = 'message assistant assessment-question';
    questionDiv.innerHTML = `
        <div class="message-content">
            <div class="question-header">
                <span class="question-number">Question ${currentQuestionIndex + 1} of ${assessmentQuestions.length}</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${((currentQuestionIndex + 1) / assessmentQuestions.length) * 100}%"></div>
                </div>
            </div>
            <div class="question-text">${question.question}</div>
            <div class="question-options">
                ${question.options.map((option, index) => `
                    <button class="option-button" onclick="selectAnswer('${option}', ${index})">${option}</button>
                `).join('')}
            </div>
        </div>
        <div class="message-time">${new Date().toLocaleTimeString()}</div>
    `;
    messagesContainer.appendChild(questionDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Handle answer selection
async function selectAnswer(answer, optionIndex) {
    const messagesContainer = document.getElementById('messages');
    
    // Store the response
    userResponses.push({
        question: assessmentQuestions[currentQuestionIndex].question,
        answer: answer,
        questionIndex: currentQuestionIndex
    });
    
    // Add user's answer as a message (this gets stored in chat history)
    const answerDiv = document.createElement('div');
    answerDiv.className = 'message user';
    answerDiv.innerHTML = `
        <div class="message-content">${answer}</div>
        <div class="message-time">${new Date().toLocaleTimeString()}</div>
    `;
    messagesContainer.appendChild(answerDiv);
    
    // Store answer in chat history via API
    try {
        await sendChatMessage(currentChatHistoryId, `Assessment Answer ${currentQuestionIndex + 1}: ${answer}`);
    } catch (error) {
        console.error('Error storing answer in chat history:', error);
    }
    
    // Move to next question
    currentQuestionIndex++;
    
    // Show next question after a brief delay
    setTimeout(() => {
        showNextQuestion(messagesContainer);
    }, 500);
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Complete the assessment
async function completeAssessment(messagesContainer) {
    // Show completion message
    const completionDiv = document.createElement('div');
    completionDiv.className = 'message assistant assessment-complete';
    completionDiv.innerHTML = `
        <div class="message-content">
            <h4>✅ Assessment Complete</h4>
            <p>Thank you for completing the mental health assessment. I'm now analyzing your responses to provide personalized recommendations.</p>
            <div class="loading-analysis">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <span>Analyzing responses...</span>
            </div>
        </div>
        <div class="message-time">${new Date().toLocaleTimeString()}</div>
    `;
    messagesContainer.appendChild(completionDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Generate assessment summary and recommendations
    setTimeout(async () => {
        await generateAssessmentSummary(messagesContainer);
    }, 2000);
}

// Generate assessment summary and recommendations
async function generateAssessmentSummary(messagesContainer) {
    try {
        // Create a summary of responses for the AI
        let summaryMessage = "Based on my mental health assessment responses:\n\n";
        userResponses.forEach((response, index) => {
            summaryMessage += `${index + 1}. ${response.question}\nAnswer: ${response.answer}\n\n`;
        });
        summaryMessage += "Please provide a comprehensive mental health assessment summary and personalized recommendations based on these responses. Include specific coping strategies and suggestions for improvement.";
        
        // Get AI analysis
        const response = await sendChatMessage(currentChatHistoryId, summaryMessage);
        
        // Remove loading message
        const loadingElement = messagesContainer.querySelector('.assessment-complete');
        if (loadingElement) {
            messagesContainer.removeChild(loadingElement);
        }
        
        // Show assessment results
        const resultsDiv = document.createElement('div');
        resultsDiv.className = 'message assistant assessment-results';
        resultsDiv.innerHTML = `
            <div class="message-content">
                <h4>🎯 Your Mental Health Assessment Results</h4>
                <div class="assessment-summary">
                    ${response.assistant_response}
                </div>
                <div class="assessment-actions">
                    <button class="action-button" onclick="retakeAssessment()">Retake Assessment</button>
                    <button class="action-button secondary" onclick="toggleAssessmentMode()">Exit Assessment Mode</button>
                </div>
            </div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `;
        messagesContainer.appendChild(resultsDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
    } catch (error) {
        console.error('Error generating assessment summary:', error);
        
        // Show error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message assistant';
        errorDiv.innerHTML = `
            <div class="message-content">
                <p>I apologize, but there was an error analyzing your assessment responses. Please try again later or contact support if the issue persists.</p>
                <button class="action-button" onclick="retakeAssessment()">Retake Assessment</button>
            </div>
            <div class="message-time">${new Date().toLocaleTimeString()}</div>
        `;
        messagesContainer.appendChild(errorDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Retake assessment
function retakeAssessment() {
    currentQuestionIndex = 0;
    userResponses = [];
    assessmentQuestions = generateAssessmentQuestions();
    
    const messagesContainer = document.getElementById('messages');
    showAssessmentIntro(messagesContainer);
}

// Add styles for assessment mode
function addAssessmentStyles() {
    if (document.getElementById('assessment-styles')) return;

    const styleElement = document.createElement('style');
    styleElement.id = 'assessment-styles';
    styleElement.textContent = `
        .assessment-mode-btn {
            padding: 10px 15px;
            margin: 10px 15px;
            background: #28a745;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .assessment-mode-btn:hover {
            background: #218838;
        }
        
        .assessment-mode-btn.active {
            background: #dc3545;
        }
        
        .assessment-mode-btn.active:hover {
            background: #c82333;
        }
        
        .assessment-notification .message-content {
            background: #e8f5e8;
            border-left: 4px solid #28a745;
        }
        
        .assessment-intro .message-content {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
        }
        
        .assessment-start-btn {
            padding: 12px 24px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 500;
            margin-top: 15px;
            transition: all 0.3s ease;
        }
        
        .assessment-start-btn:hover {
            background: #0056b3;
        }
        
        .question-header {
            margin-bottom: 15px;
        }
        
        .question-number {
            font-size: 14px;
            color: #6c757d;
            font-weight: 500;
        }
        
        .progress-bar {
            width: 100%;
            height: 6px;
            background: #e9ecef;
            border-radius: 3px;
            margin-top: 8px;
            overflow: hidden;
        }
        
        .progress-fill {
            height: 100%;
            background: #007bff;
            transition: width 0.3s ease;
        }
        
        .question-text {
            font-size: 16px;
            font-weight: 500;
            margin-bottom: 15px;
            line-height: 1.5;
        }
        
        .question-options {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .option-button {
            padding: 12px 16px;
            background: white;
            border: 2px solid #dee2e6;
            border-radius: 6px;
            text-align: left;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
        }
        
        .option-button:hover {
            border-color: #007bff;
            background: #f8f9fa;
        }
        
        .loading-analysis {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 15px;
            font-style: italic;
            color: #6c757d;
        }
        
        .assessment-summary {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            margin: 15px 0;
            line-height: 1.6;
        }
        
        .assessment-actions {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }
        
        .action-button {
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .action-button:hover {
            background: #0056b3;
        }
        
        .action-button.secondary {
            background: #6c757d;
        }
        
        .action-button.secondary:hover {
            background: #545b62;
        }
        
        .assessment-question .message-content,
        .assessment-intro .message-content,
        .assessment-complete .message-content,
        .assessment-results .message-content {
            max-width: 90%;
        }
        
        @media (max-width: 768px) {
            .question-options {
                gap: 6px;
            }
            
            .option-button {
                padding: 10px 12px;
                font-size: 13px;
            }
            
            .assessment-actions {
                flex-direction: column;
            }
        }
    `;
    document.head.appendChild(styleElement);
}

// Initialize assessment mode when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    addAssessmentStyles();
});