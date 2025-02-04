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
        const response = await fetch('http://localhost:8000/mental-health/get_advice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                symptoms: selectedSymptoms,
                answers: userAnswers
            })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        if (!data.assessment || !data.advice) {
            throw new Error('Invalid response format from server');
        }

        displayAdvice(data);
    } catch (error) {
        console.error('Error getting advice:', error);
        alert(error.message || 'Failed to generate advice. Please try again.');
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