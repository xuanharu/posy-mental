// State management
let selectedSymptoms = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = {};

// DOM Elements
const symptomsContainer = document.getElementById('symptomsContainer');
const generateBtn = document.getElementById('generateBtn');
const questionContainer = document.getElementById('questionContainer');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const adviceResult = document.getElementById('adviceResult');
const adviceContent = document.getElementById('adviceContent');
const relatedPostsList = document.getElementById('relatedPostsList');

// Initialize symptoms
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

// Initialize the page
function initializePage() {
    renderSymptoms();
    setupEventListeners();
}

// Render symptom tags
function renderSymptoms() {
    symptomsContainer.innerHTML = symptoms.map(symptom => `
        <span class="symptom-tag" data-symptom="${symptom}">${symptom}</span>
    `).join('');
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Setup event listeners
function setupEventListeners() {
    // Clear existing content and re-render
    symptomsContainer.innerHTML = '';
    renderSymptoms();

    // Debounced symptom click handler
    const debouncedToggle = debounce(async(target) => {
        if (!target.classList.contains('symptom-tag')) return;

        // Add visual feedback
        target.style.opacity = '0.6';
        target.style.pointerEvents = 'none';

        try {
            await toggleSymptom(target);
        } finally {
            // Remove visual feedback
            target.style.opacity = '';
            target.style.pointerEvents = '';
        }
    }, 300);

    // Symptom selection with event delegation
    symptomsContainer.addEventListener('click', (e) => {
        debouncedToggle(e.target);
    });

    // Generate button click handler
    generateBtn.addEventListener('click', debounce(async() => {
        generateBtn.disabled = true;
        try {
            await fetchQuestions();
        } finally {
            generateBtn.disabled = false;
        }
    }, 300));

    // Navigation buttons
    prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!prevBtn.disabled) {
            showPreviousQuestion();
        }
    });

    nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!nextBtn.disabled) {
            handleNextButton();
        }
    });

    // Ensure buttons are properly initialized
    updateNavigationButtons();
}

// Toggle symptom selection
async function toggleSymptom(element) {
    return new Promise((resolve) => {
        const symptom = element.dataset.symptom;
        const wasSelected = element.classList.contains('selected');

        // Update visual state
        element.classList.toggle('selected');

        // Update selected symptoms array
        if (!wasSelected) {
            selectedSymptoms.push(symptom);
        } else {
            selectedSymptoms = selectedSymptoms.filter(s => s !== symptom);
        }

        // Update generate button visibility
        if (selectedSymptoms.length > 0) {
            generateBtn.style.display = 'inline-block';
        } else {
            generateBtn.style.display = 'none';
            hideQuestions();
        }

        resolve();
    });
}

// Fetch questions from backend
async function fetchQuestions() {
    console.log('Fetching questions for symptoms:', selectedSymptoms);
    try {
        if (selectedSymptoms.length === 0) {
            throw new Error('Please select at least one symptom');
        }

        const requestBody = { symptoms: selectedSymptoms };
        const response = await fetch('http://localhost:8000/mental-health/get_questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        if (!data.questions || !Array.isArray(data.questions)) {
            throw new Error('Invalid response format: missing questions array');
        }

        currentQuestions = data.questions;
        currentQuestionIndex = 0;
        showQuestions();
    } catch (error) {
        console.error('Error fetching questions:', error);
        alert(error.message || 'Failed to load questions. Please try again.');
    }
}

// Show questions section
function showQuestions() {
    generateBtn.style.display = 'none';
    questionContainer.classList.add('active');
    adviceResult.classList.remove('active');
    displayCurrentQuestion();
}

// Hide questions section
function hideQuestions() {
    questionContainer.classList.remove('active');
    adviceResult.classList.remove('active');
    currentQuestions = [];
    currentQuestionIndex = 0;
    userAnswers = {};
}

// Display current question
function displayCurrentQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    if (!question) {
        console.error('No question found for index:', currentQuestionIndex);
        return;
    }

    // Show symptom context along with the question
    questionText.innerHTML = `
        <div class="symptom-context mb-3">
            <span class="badge bg-primary">${question.symptom}</span>
        </div>
        <div class="question-text">
            ${question.question}
        </div>
    `;

    optionsContainer.innerHTML = question.options.map(option => `
        <button class="option-btn ${userAnswers[question.question] === option ? 'selected' : ''}" 
                data-option="${option}">
            ${option}
        </button>
    `).join('');

    // Add click handlers to options
    optionsContainer.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => selectOption(btn, question.question));
    });

    updateNavigationButtons();
}

// Select an option
function selectOption(button, question) {
    // Remove selection from other options
    optionsContainer.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    // Add selection to clicked option
    button.classList.add('selected');
    userAnswers[question] = button.dataset.option;
}

// Update navigation buttons
function updateNavigationButtons() {
    console.log('Updating navigation buttons:', {
        currentIndex: currentQuestionIndex,
        totalQuestions: currentQuestions.length,
        isLastQuestion: currentQuestionIndex === currentQuestions.length - 1
    });

    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = false;
    nextBtn.textContent = currentQuestionIndex === currentQuestions.length - 1 ? 'Get Advice' : 'Next';

    // Ensure buttons are visible and clickable
    prevBtn.style.display = 'inline-block';
    nextBtn.style.display = 'inline-block';
    prevBtn.style.pointerEvents = prevBtn.disabled ? 'none' : 'auto';
    nextBtn.style.pointerEvents = 'auto';

    // Add specific styling for better visibility
    nextBtn.style.backgroundColor = '#1A76D1';
    nextBtn.style.color = '#fff';
    nextBtn.style.padding = '10px 20px';
    nextBtn.style.borderRadius = '5px';
    nextBtn.style.cursor = 'pointer';
}

// Show previous question
function showPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayCurrentQuestion();
    }
}

// Handle next button click
function handleNextButton() {
    console.log('Handle next button:', {
        currentIndex: currentQuestionIndex,
        totalQuestions: currentQuestions.length,
        currentAnswers: userAnswers
    });

    const question = currentQuestions[currentQuestionIndex];
    if (!question || !question.question) {
        console.error('No current question found');
        return;
    }

    if (!userAnswers[question.question]) {
        alert('Please select an option before proceeding.');
        return;
    }

    console.log('Current question answered:', {
        question: question.question,
        answer: userAnswers[question.question]
    });

    if (currentQuestionIndex === currentQuestions.length - 1) {
        console.log('Last question reached, submitting answers');
        submitAnswers();
    } else {
        console.log('Moving to next question');
        currentQuestionIndex++;
        displayCurrentQuestion();
    }
}

// Submit answers and get advice
async function submitAnswers() {
    try {
        // Show loading state
        nextBtn.disabled = true;
        nextBtn.textContent = 'Processing...';

        // Validate answers
        const unansweredQuestions = currentQuestions.filter(q => !userAnswers[q.question]);
        if (unansweredQuestions.length > 0) {
            throw new Error('Please answer all questions before proceeding.');
        }

        const response = await fetch('http://localhost:8000/mental-health/get_advice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                symptoms: selectedSymptoms,
                answers: userAnswers
            })
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.detail || `Server error: ${response.status}`);
        }

        if (!responseData.assessment || !responseData.advice) {
            throw new Error('Invalid response format from server');
        }

        displayAdvice(responseData);
    } catch (error) {
        console.error('Error getting advice:', error);

        // Show error message in a more user-friendly way
        const errorMessage = document.createElement('div');
        errorMessage.className = 'alert alert-danger mt-3';
        errorMessage.innerHTML = `
            <h5>Unable to Generate Advice</h5>
            <p>${error.message}</p>
            <p>Please try again or contact support if the problem persists.</p>
            <button class="btn btn-primary mt-2" onclick="retrySubmission()">Try Again</button>
        `;

        questionContainer.appendChild(errorMessage);
    } finally {
        // Reset button state
        nextBtn.disabled = false;
        nextBtn.textContent = 'Get Advice';
    }
}

// Retry submission function
function retrySubmission() {
    // Remove error message if exists
    const errorMessage = questionContainer.querySelector('.alert-danger');
    if (errorMessage) {
        errorMessage.remove();
    }

    // Re-enable submission
    submitAnswers();
}

// Display advice
function displayAdvice(advice) {
    questionContainer.classList.remove('active');
    adviceResult.classList.add('active');

    // Calculate severity levels based on answers
    const severityLevels = calculateSeverityLevels(userAnswers, selectedSymptoms);

    // Generate status indicators
    const statusIndicators = generateStatusIndicators(severityLevels);

    // Build comprehensive advice content
    adviceContent.innerHTML = `
        <div class="mb-4">
            <h4>Mental Health Status</h4>
            <div class="status-indicators">
                ${statusIndicators}
            </div>
            <div class="severity-summary mt-3">
                <p><strong>Overall Assessment:</strong> ${advice.assessment}</p>
            </div>
        </div>
        
        <div class="mb-4">
            <h4>Detailed Analysis</h4>
            <div class="symptom-analysis">
                ${generateSymptomAnalysis(severityLevels)}
            </div>
        </div>

        <div class="mb-4">
            <h4>Personalized Recommendations</h4>
            <div class="recommendations">
                ${generateRecommendations(advice.advice, severityLevels)}
            </div>
        </div>
        
        ${advice.professional_help ? `
        <div class="mb-4 professional-help-section">
            <h4>Professional Help Recommendations</h4>
            <div class="alert alert-info">
                <i class="fa fa-info-circle"></i>
                <p>${advice.professional_help}</p>
            </div>
        </div>
        ` : ''}
        
        <div class="mb-4">
            <h4>Self-Care Action Plan</h4>
            <div class="action-plan">
                ${generateActionPlan(advice, severityLevels)}
            </div>
        </div>
    `;

    // Add custom styles for the new sections
    addCustomStyles();

    // Display related articles with enhanced relevance
    if (advice.related_keywords && advice.related_keywords.length > 0) {
        fetchRelatedArticles(advice.related_keywords);
    }
}

// Calculate severity levels for symptoms
function calculateSeverityLevels(answers, symptoms) {
    const severityLevels = {};
    
    symptoms.forEach(symptom => {
        let severityScore = 0;
        let questionCount = 0;
        
        // Analyze answers related to this symptom
        Object.entries(answers).forEach(([question, answer]) => {
            if (question.toLowerCase().includes(symptom.toLowerCase())) {
                // Calculate score based on answer severity
                const score = calculateAnswerScore(answer);
                severityScore += score;
                questionCount++;
            }
        });
        
        // Calculate average severity if there were relevant questions
        if (questionCount > 0) {
            severityLevels[symptom] = {
                level: severityScore / questionCount,
                count: questionCount
            };
        }
    });
    
    return severityLevels;
}

// Calculate score for individual answers with more nuanced analysis
function calculateAnswerScore(answer) {
    const severityScales = {
        critical: ['always', 'severe', 'extreme', 'unbearable', 'constantly'],
        high: ['frequent', 'strong', 'very', 'significant', 'most of the time'],
        moderate: ['sometimes', 'moderate', 'occasionally', 'somewhat', 'intermittent'],
        low: ['rarely', 'mild', 'slight', 'minimal', 'seldom'],
        none: ['never', 'no', 'none', 'not at all']
    };
    
    answer = answer.toLowerCase();
    
    // Check each severity level
    if (severityScales.critical.some(keyword => answer.includes(keyword))) {
        return 4; // Critical severity
    } else if (severityScales.high.some(keyword => answer.includes(keyword))) {
        return 3; // High severity
    } else if (severityScales.moderate.some(keyword => answer.includes(keyword))) {
        return 2; // Moderate severity
    } else if (severityScales.low.some(keyword => answer.includes(keyword))) {
        return 1; // Low severity
    } else if (severityScales.none.some(keyword => answer.includes(keyword))) {
        return 0; // No severity
    }
    
    // Default to moderate if no specific keywords found
    return 2;
}

// Generate visual status indicators
function generateStatusIndicators(severityLevels) {
    return Object.entries(severityLevels).map(([symptom, data]) => {
        const severityClass = getSeverityClass(data.level);
        return `
            <div class="status-indicator ${severityClass}">
                <span class="symptom-name">${symptom}</span>
                <div class="severity-bar">
                    <div class="severity-fill" style="width: ${(data.level / 3) * 100}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

// Generate detailed symptom analysis
function generateSymptomAnalysis(severityLevels) {
    return Object.entries(severityLevels).map(([symptom, data]) => {
        const severityText = getSeverityText(data.level);
        return `
            <div class="symptom-detail">
                <h5>${symptom}</h5>
                <p>Severity: <span class="severity-${getSeverityClass(data.level)}">${severityText}</span></p>
                <p>${generateSymptomInsight(symptom, data.level)}</p>
            </div>
        `;
    }).join('');
}

// Generate personalized recommendations
function generateRecommendations(advice, severityLevels) {
    const recommendations = [];
    
    // Add general advice
    recommendations.push(`<div class="recommendation-item general">
        <h5>General Advice</h5>
        <p>${advice}</p>
    </div>`);
    
    // Add symptom-specific recommendations
    Object.entries(severityLevels).forEach(([symptom, data]) => {
        if (data.level >= 2) {
            recommendations.push(`
                <div class="recommendation-item specific">
                    <h5>For ${symptom}</h5>
                    <p>${getSymptomSpecificAdvice(symptom, data.level)}</p>
                </div>
            `);
        }
    });
    
    return recommendations.join('');
}

// Generate action plan
function generateActionPlan(advice, severityLevels) {
    const steps = [];
    const overallSeverity = calculateOverallSeverity(severityLevels);
    
    // Immediate actions
    steps.push(`
        <div class="action-step immediate">
            <h5>Immediate Steps</h5>
            <ul>
                ${generateImmediateSteps(severityLevels)}
            </ul>
        </div>
    `);
    
    // Short-term goals
    steps.push(`
        <div class="action-step short-term">
            <h5>This Week</h5>
            <ul>
                ${generateShortTermGoals(severityLevels)}
            </ul>
        </div>
    `);
    
    // Long-term recommendations
    if (overallSeverity >= 2) {
        steps.push(`
            <div class="action-step long-term">
                <h5>Long-term Support</h5>
                <ul>
                    ${generateLongTermRecommendations(severityLevels)}
                </ul>
            </div>
        `);
    }
    
    return steps.join('');
}

// Helper functions for severity classification
function getSeverityClass(level) {
    if (level >= 2.5) return 'high';
    if (level >= 1.5) return 'medium';
    return 'low';
}

function getSeverityText(level) {
    if (level >= 2.5) return 'High';
    if (level >= 1.5) return 'Moderate';
    return 'Mild';
}

function calculateOverallSeverity(severityLevels) {
    const levels = Object.values(severityLevels);
    return levels.reduce((sum, data) => sum + data.level, 0) / levels.length;
}

// Generate detailed symptom-specific insights with severity considerations
function generateSymptomInsight(symptom, level) {
    const insights = {
        'Anxiety': {
            base: 'Anxiety can manifest as persistent worry and physical symptoms like rapid heartbeat.',
            detail: level >= 2.5 ? 
                'Your responses indicate significant anxiety levels that may be interfering with daily life. Physical symptoms might include racing heart, sweating, trembling, and difficulty breathing.' :
                'While some anxiety is present, it appears manageable. However, monitoring these symptoms is important for your well-being.'
        },
        'Depression': {
            base: 'Depression often affects mood, energy levels, and interest in daily activities.',
            detail: level >= 2.5 ?
                'Your responses suggest notable depressive symptoms that may be significantly impacting your daily functioning and emotional well-being.' :
                'While some mood changes are present, they appear to be mild to moderate. Maintaining support systems and healthy routines is important.'
        },
        'Sleep Issues': {
            base: 'Sleep problems can impact overall mental health and daily functioning.',
            detail: level >= 2.5 ?
                'Your sleep difficulties appear to be significant and may be affecting multiple areas of your life, including mood and energy levels.' :
                'While some sleep disruption is present, implementing good sleep hygiene practices could help improve your rest quality.'
        },
        'Stress': {
            base: 'Chronic stress can affect both mental and physical well-being.',
            detail: level >= 2.5 ?
                'Your stress levels appear to be significantly elevated, which may be impacting both your mental and physical health.' :
                'While some stress is present, it seems manageable with appropriate coping strategies.'
        },
        'Mood Swings': {
            base: 'Frequent mood changes can indicate underlying emotional challenges.',
            detail: level >= 2.5 ?
                'Your mood variations appear to be significant and may be affecting your relationships and daily activities.' :
                'While some mood fluctuations are present, they seem to be within a manageable range.'
        },
        'Social Withdrawal': {
            base: 'Withdrawing from social interactions may signal emotional difficulties.',
            detail: level >= 2.5 ?
                'Your responses indicate significant social withdrawal, which may be impacting your support systems and emotional well-being.' :
                'While some social hesitation is present, maintaining connections with others can help support your mental health.'
        },
        'Concentration Problems': {
            base: 'Difficulty focusing can impact work and daily tasks.',
            detail: level >= 2.5 ?
                'Your concentration difficulties appear to be significantly affecting your daily activities and productivity.' :
                'While some focus issues are present, they seem manageable with appropriate strategies.'
        },
        'Fatigue': {
            base: 'Persistent tiredness can affect mental clarity and emotional resilience.',
            detail: level >= 2.5 ?
                'Your fatigue levels appear to be significantly impacting your daily functioning and energy levels.' :
                'While some tiredness is present, maintaining regular rest and activity patterns may help improve energy levels.'
        },
        'Loss of Interest': {
            base: 'Decreased interest in activities may indicate mood changes.',
            detail: level >= 2.5 ?
                'Your responses suggest a significant decrease in interest or pleasure in activities, which may indicate underlying mood issues.' :
                'While some decrease in interest is noted, engaging in enjoyable activities can help maintain emotional well-being.'
        },
        'Irritability': {
            base: 'Increased irritability can strain relationships and daily interactions.',
            detail: level >= 2.5 ?
                'Your irritability levels appear to be significant and may be affecting your relationships and daily interactions.' :
                'While some irritability is present, developing coping strategies can help manage these feelings.'
        }
    };
    
    const symptomInsight = insights[symptom] || {
        base: 'This symptom may impact your daily well-being.',
        detail: level >= 2.5 ? 
            'The severity of this symptom suggests professional evaluation may be beneficial.' :
            'While present, this symptom appears manageable with appropriate self-care strategies.'
    };
    
    return `${symptomInsight.base} ${symptomInsight.detail}`;
}

function getSymptomSpecificAdvice(symptom, level) {
    const advice = {
        'Anxiety': 'Practice deep breathing exercises and consider mindfulness meditation.',
        'Depression': 'Maintain a daily routine and reach out to supportive friends or family.',
        'Sleep Issues': 'Establish a consistent sleep schedule and create a relaxing bedtime routine.',
        'Stress': 'Take regular breaks and practice stress-management techniques.',
        'Mood Swings': 'Track your moods and identify triggers that affect your emotional state.',
        'Social Withdrawal': 'Start with small social interactions and gradually increase engagement.',
        'Concentration Problems': 'Break tasks into smaller, manageable parts and minimize distractions.',
        'Fatigue': 'Balance activity with rest and maintain a healthy sleep schedule.',
        'Loss of Interest': 'Try reintroducing previously enjoyed activities gradually.',
        'Irritability': 'Practice relaxation techniques and identify stress triggers.'
    };
    
    return advice[symptom] || 'Focus on self-care and maintaining a healthy routine.';
}

function generateImmediateSteps(severityLevels) {
    const steps = [];
    const highSeveritySymptoms = Object.entries(severityLevels)
        .filter(([_, data]) => data.level >= 2.5);
    
    if (highSeveritySymptoms.length > 0) {
        steps.push('<li>Contact a mental health professional for assessment</li>');
    }
    
    steps.push('<li>Practice deep breathing exercises when feeling overwhelmed</li>');
    steps.push('<li>Maintain regular sleep and meal schedules</li>');
    
    return steps.join('');
}

function generateShortTermGoals(severityLevels) {
    const goals = [];
    
    goals.push('<li>Keep a daily mood and symptom journal</li>');
    goals.push('<li>Establish a regular exercise routine</li>');
    
    if (Object.values(severityLevels).some(data => data.level >= 2)) {
        goals.push('<li>Schedule an appointment with a counselor or therapist</li>');
    }
    
    return goals.join('');
}

function generateLongTermRecommendations(severityLevels) {
    const recommendations = [];
    const overallSeverity = calculateOverallSeverity(severityLevels);
    
    // Core recommendations
    recommendations.push('<li>Build a long-term self-care routine including regular exercise, healthy diet, and adequate sleep</li>');
    recommendations.push('<li>Develop and maintain a strong support network of friends, family, and professionals</li>');
    
    // Severity-based recommendations
    if (overallSeverity >= 2.5) {
        recommendations.push('<li>Consider regular therapy or counseling sessions for ongoing support</li>');
        recommendations.push('<li>Discuss potential treatment options with a mental health professional</li>');
        recommendations.push('<li>Create a crisis management plan with professional guidance</li>');
    } else if (overallSeverity >= 1.5) {
        recommendations.push('<li>Consider periodic check-ins with a mental health professional</li>');
        recommendations.push('<li>Learn and practice stress management techniques</li>');
        recommendations.push('<li>Join support groups or community activities</li>');
    }
    
    // Lifestyle recommendations
    recommendations.push('<li>Practice mindfulness or meditation regularly</li>');
    recommendations.push('<li>Set realistic goals and celebrate small achievements</li>');
    recommendations.push('<li>Maintain work-life balance and set healthy boundaries</li>');
    
    return recommendations.join('');
}

// Add custom styles for the enhanced display
function addCustomStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .status-indicators {
            display: grid;
            gap: 15px;
            margin-top: 20px;
        }
        
        .status-indicator {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
        }
        
        .severity-bar {
            height: 8px;
            background: #e9ecef;
            border-radius: 4px;
            margin-top: 8px;
            overflow: hidden;
        }
        
        .severity-fill {
            height: 100%;
            transition: width 0.3s ease;
        }
        
        .high .severity-fill {
            background: #dc3545;
        }
        
        .medium .severity-fill {
            background: #ffc107;
        }
        
        .low .severity-fill {
            background: #28a745;
        }
        
        .symptom-detail {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .recommendation-item {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 15px;
        }
        
        .action-step {
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .severity-high {
            color: #dc3545;
            font-weight: bold;
        }
        
        .severity-medium {
            color: #ffc107;
            font-weight: bold;
        }
        
        .severity-low {
            color: #28a745;
            font-weight: bold;
        }
        
        .professional-help-section {
            background: #e3f2fd;
            padding: 20px;
            border-radius: 8px;
        }
    `;
    document.head.appendChild(styleElement);
}

// Fetch related articles based on keywords
async function fetchRelatedArticles(keywords) {
    try {
        // First try to fetch articles from your articles system
        const response = await fetch('http://localhost:8000/posts/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                keywords: keywords,
                limit: 3
            })
        });

        if (response.ok) {
            const articles = await response.json();
            if (articles && articles.length > 0) {
                relatedPostsList.innerHTML = articles.map(article => `
                    <div class="related-post-item">
                        <h5><a href="/article-single.html?id=${article.id}">${article.title}</a></h5>
                        <p>${article.excerpt || article.description}</p>
                    </div>
                `).join('');
                return;
            }
        }

        // Fallback to displaying keywords if no articles found
        relatedPostsList.innerHTML = `
            <div class="related-post-item">
                <p>Related topics: ${keywords.join(', ')}</p>
                <p>Visit our <a href="/articles.html">Articles section</a> for more information on mental health topics.</p>
            </div>
        `;
    } catch (error) {
        console.error('Error fetching related articles:', error);
        relatedPostsList.innerHTML = `
            <div class="related-post-item">
                <p>Explore articles about: ${keywords.join(', ')}</p>
                <p>Visit our <a href="/articles.html">Articles section</a> for more information.</p>
            </div>
        `;
    }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);