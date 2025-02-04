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

// Setup event listeners
function setupEventListeners() {
    // Symptom selection
    symptomsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('symptom-tag')) {
            toggleSymptom(e.target);
        }
    });

    // Generate button
    generateBtn.addEventListener('click', fetchQuestions);

    // Navigation buttons
    prevBtn.addEventListener('click', showPreviousQuestion);
    nextBtn.addEventListener('click', handleNextButton);
}

// Toggle symptom selection
function toggleSymptom(element) {
    const symptom = element.dataset.symptom;
    element.classList.toggle('selected');

    if (element.classList.contains('selected')) {
        selectedSymptoms.push(symptom);
    } else {
        selectedSymptoms = selectedSymptoms.filter(s => s !== symptom);
    }

    if (selectedSymptoms.length > 0) {
        generateBtn.style.display = 'inline-block';
    } else {
        generateBtn.style.display = 'none';
        hideQuestions();
    }
}

// Fetch questions from backend
async function fetchQuestions() {
    try {
        const response = await fetch('http://localhost:8000/mental-health/get_questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ symptoms: selectedSymptoms })
        });

        if (!response.ok) throw new Error('Failed to fetch questions');

        const data = await response.json();
        currentQuestions = data.questions;
        currentQuestionIndex = 0;
        showQuestions();
    } catch (error) {
        console.error('Error fetching questions:', error);
        alert('Failed to load questions. Please try again.');
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
    questionText.textContent = question.question;

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

    // Update navigation buttons
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
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.textContent = currentQuestionIndex === currentQuestions.length - 1 ? 'Get Advice' : 'Next';
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
    const currentQuestion = currentQuestions[currentQuestionIndex].question;

    if (!userAnswers[currentQuestion]) {
        alert('Please select an option before proceeding.');
        return;
    }

    if (currentQuestionIndex === currentQuestions.length - 1) {
        submitAnswers();
    } else {
        currentQuestionIndex++;
        displayCurrentQuestion();
    }
}

// Submit answers and get advice
async function submitAnswers() {
    try {
        const response = await fetch('http://localhost:8000/mental-health/get_advice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                symptoms: selectedSymptoms,
                answers: userAnswers
            })
        });

        if (!response.ok) throw new Error('Failed to get advice');

        const advice = await response.json();
        displayAdvice(advice);
    } catch (error) {
        console.error('Error getting advice:', error);
        alert('Failed to generate advice. Please try again.');
    }
}

// Display advice
function displayAdvice(advice) {
    questionContainer.classList.remove('active');
    adviceResult.classList.add('active');

    adviceContent.innerHTML = `
        <div class="mb-4">
            <h4>Assessment</h4>
            <p>${advice.assessment}</p>
        </div>
        <div class="mb-4">
            <h4>Personalized Advice</h4>
            <p>${advice.advice}</p>
        </div>
        ${advice.professional_help ? `
        <div class="mb-4">
            <h4>Professional Help Recommendations</h4>
            <p>${advice.professional_help}</p>
        </div>
        ` : ''}
    `;

    // Display related articles if available
    if (advice.related_keywords && advice.related_keywords.length > 0) {
        fetchRelatedArticles(advice.related_keywords);
    }
}

// Fetch related articles based on keywords
async function fetchRelatedArticles(keywords) {
    // This function would integrate with your existing articles system
    // For now, we'll just display the keywords
    relatedPostsList.innerHTML = `
        <div class="related-post-item">
            <p>Related topics: ${keywords.join(', ')}</p>
            <p>Check our Articles section for more information on these topics.</p>
        </div>
    `;
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);