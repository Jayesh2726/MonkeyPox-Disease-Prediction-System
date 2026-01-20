// ==================== CHATBOT CONFIGURATION ====================

const chatbotConfig = {
    name: 'MediBot',
    tone: 'professional, friendly, and empathetic',
    language: 'clear, non-technical, conversational',
    
    // Confidence level thresholds
    confidenceThresholds: {
        high: 75,      // >= 75% is high confidence
        medium: 50,    // >= 50% is medium confidence
        low: 0         // < 50% is low confidence
    },

    // Disease descriptions
    diseaseInfo: {
        'Measles': {
            description: 'a highly contagious viral infection characterized by fever, cough, and a distinctive rash',
            severity: 'moderate to high',
            seek_help: 'Immediate medical consultation recommended'
        },
        'Monkeypox': {
            description: 'a viral infection that spreads through direct contact, causing skin lesions and fever',
            severity: 'moderate',
            seek_help: 'Medical consultation recommended'
        },
        'Chickenpox': {
            description: 'a highly contagious viral infection known for its characteristic chickenpox rash',
            severity: 'mild to moderate',
            seek_help: 'Medical consultation recommended'
        },
        'Normal': {
            description: 'healthy skin with no signs of the diseases being detected',
            severity: 'none - normal',
            seek_help: 'Continue maintaining good skin health practices'
        }
    }
};

// ==================== CHATBOT STATE MANAGEMENT ====================

let chatbotState = {
    isOpen: false,
    messages: [],
    currentPrediction: null,
    conversationHistory: [],
    userHasAskedAboutAccuracy: false,
    userHasAskedAboutTrust: false
};

// ==================== CHATBOT MESSAGE TEMPLATES ====================

const messageTemplates = {
    // Greeting messages
    greeting: [
        "👋 Hi there! I'm MediBot. I'm here to help you understand your prediction results. What would you like to know?",
        "Hello! 👋 I can explain your test results, answer questions about accuracy, and provide guidance. How can I assist you?",
        "Welcome! 👋 I'm MediBot, your AI assistant. Feel free to ask me anything about your prediction!"
    ],

    // Confidence level explanations
    confidenceExplanations: {
        high: "The model is very confident in this classification with {confidence}% confidence. This means the visual characteristics strongly match {disease}.",
        medium: "The model has moderate confidence in this classification with {confidence}% confidence. The visual characteristics are somewhat consistent with {disease}.",
        low: "The model has low confidence in this classification with {confidence}% confidence. The visual characteristics show some uncertainty, and expert review is highly recommended."
    },

    // Common question responses
    questionResponses: {
        'meaning': "The predicted class '{disease}' indicates that the model has identified visual characteristics consistent with {disease}. With a confidence score of {confidence}%, the system is {confidenceLevel} confident in this assessment.",
        
        'accuracy': "The accuracy of our model depends on several factors:\n✓ Image Quality: Clear, well-lit images produce more reliable results\n✓ Image Angle: Multiple angles improve accuracy\n✓ Lighting: Natural or even lighting is ideal\n✓ Cleanliness: Clean skin surface without obstruction\n\nOur model typically achieves {accuracy}% accuracy on properly captured images.",
        
        'trust': "You should consider these factors when trusting results:\n⚠️ This is AI analysis, not professional diagnosis\n✓ Results are based on visual patterns only\n✓ Professional medical consultation is essential\n✓ Use this as a supportive tool, not a definitive diagnosis\n\nAlways consult a healthcare provider for final diagnosis.",
        
        'improvement': "To get better predictions, follow these guidelines:\n📸 Image Quality: Use a high-resolution camera\n💡 Lighting: Use natural daylight or bright indoor lighting\n📐 Angle: Capture the affected area straight-on\n🧼 Cleanliness: Ensure the skin is clean and dry\n🎯 Focus: Make sure the affected area is the main subject\n\nThese factors significantly impact prediction accuracy.",
        
        'disclaimer': "⚠️ Important Disclaimer:\n• This tool uses AI image analysis only\n• It is NOT a medical diagnosis\n• Results should NOT replace professional medical advice\n• Always consult a qualified healthcare professional\n• Use this system as a supplementary tool, not a definitive diagnosis\n\nYour health is important—seek professional guidance!"
    },

    // Disease-specific guidance
    diseaseGuidance: {
        'Measles': "Based on the prediction of Measles:\n• Seek immediate medical attention\n• Isolation may be required\n• Vaccination status is important\n• Symptoms include fever, cough, and rash\n\n⚠️ This is not professional medical advice. Please consult a doctor immediately.",
        
        'Monkeypox': "Based on the prediction of Monkeypox:\n• Medical consultation is strongly recommended\n• Avoid direct contact with others\n• Keep the area clean\n• Monitor for symptom progression\n\n⚠️ This is not professional medical advice. Please consult a doctor.",
        
        'Chickenpox': "Based on the prediction of Chickenpox:\n• Medical consultation is recommended\n• Rest and hydration are important\n• Avoid scratching to prevent infection\n• Keep the area clean and dry\n\n⚠️ This is not professional medical advice. Please consult a doctor.",
        
        'Normal': "Great news! The model indicates normal, healthy skin.\n✓ Continue with your regular skin care routine\n✓ Maintain good hygiene practices\n✓ Protect your skin from environmental damage\n✓ If concerned about any changes, consult a doctor\n\nStay healthy!"
    },

    // Follow-up prompts
    followUpPrompts: [
        "Would you like to know more about improving prediction accuracy?",
        "Do you have any other questions about your results?",
        "Would you like guidance on how to capture better images?",
        "Can I help explain anything else about your prediction?"
    ]
};

// ==================== RULE-BASED RESPONSE ENGINE ====================

/**
 * Determine confidence level based on score
 */
function getConfidenceLevel(confidence) {
    if (confidence >= chatbotConfig.confidenceThresholds.high) {
        return { level: 'high', description: 'very confident' };
    } else if (confidence >= chatbotConfig.confidenceThresholds.medium) {
        return { level: 'medium', description: 'moderately confident' };
    } else {
        return { level: 'low', description: 'not very confident' };
    }
}

/**
 * Generate prediction explanation
 */
function generatePredictionExplanation(prediction) {
    const disease = prediction.predicted_class;
    const confidence = prediction.confidence;
    const confidenceData = getConfidenceLevel(confidence);
    
    let explanation = `Great! I've analyzed the prediction:\n\n`;
    explanation += `🔍 **Predicted Disease:** ${disease}\n`;
    explanation += `📊 **Confidence Score:** ${confidence}%\n`;
    explanation += `💡 **Confidence Level:** ${confidenceData.description}\n\n`;
    
    explanation += `${messageTemplates.confidenceExplanations[confidenceData.level]
        .replace('{confidence}', confidence)
        .replace('{disease}', disease)}\n\n`;
    
    if (confidenceData.level === 'low') {
        explanation += `⚠️ Because confidence is low, I strongly recommend:\n`;
        explanation += `• Retaking the image with better lighting\n`;
        explanation += `• Consulting a healthcare professional\n`;
        explanation += `• Not relying solely on this result\n\n`;
    }
    
    explanation += `Would you like to know more about what this means or how to improve future predictions?`;
    
    return explanation;
}

/**
 * Answer common questions based on prediction
 */
function answerCommonQuestion(question, prediction) {
    const disease = prediction.predicted_class;
    const confidence = prediction.confidence;
    const confidenceData = getConfidenceLevel(confidence);
    
    const questionLower = question.toLowerCase();
    
    // What does this prediction mean?
    if (questionLower.includes('mean') || questionLower.includes('indicate') || questionLower.includes('what is')) {
        return messageTemplates.questionResponses['meaning']
            .replace('{disease}', disease)
            .replace('{confidence}', confidence)
            .replace('{confidenceLevel}', confidenceData.description);
    }
    
    // How accurate is the result?
    if (questionLower.includes('accurate') || questionLower.includes('accuracy') || questionLower.includes('reliable')) {
        chatbotState.userHasAskedAboutAccuracy = true;
        return messageTemplates.questionResponses['accuracy']
            .replace('{accuracy}', '88-95'); // Replace with your actual model accuracy
    }
    
    // Can this result be trusted?
    if (questionLower.includes('trust') || questionLower.includes('believe') || questionLower.includes('confident')) {
        chatbotState.userHasAskedAboutTrust = true;
        return messageTemplates.questionResponses['trust'];
    }
    
    // How to get better predictions?
    if (questionLower.includes('better') || questionLower.includes('improve') || questionLower.includes('guidance')) {
        return messageTemplates.questionResponses['improvement'];
    }
    
    // Disclaimer or safety
    if (questionLower.includes('disclaimer') || questionLower.includes('safe') || questionLower.includes('professional')) {
        return messageTemplates.questionResponses['disclaimer'];
    }
    
    return null;
}

/**
 * Generate disease-specific guidance
 */
function getDiseaseGuidance(disease) {
    return messageTemplates.diseaseGuidance[disease] || 
        `I don't have specific guidance for ${disease}. Please consult a healthcare professional.`;
}

/**
 * Get confidence-based recommendation
 */
function getConfidenceBasedRecommendation(confidence, disease) {
    const confidenceData = getConfidenceLevel(confidence);
    
    if (confidenceData.level === 'high') {
        return `Since the model is very confident about ${disease} (${confidence}%), the prediction is likely reliable. However, always consult a healthcare professional for final diagnosis.`;
    } else if (confidenceData.level === 'medium') {
        return `The model has moderate confidence about ${disease} (${confidence}%). While the prediction is reasonably reliable, I recommend consulting a healthcare professional to confirm.`;
    } else {
        return `The model has low confidence about this prediction (${confidence}%). Please don't rely solely on this result. Consulting a healthcare professional is strongly recommended.`;
    }
}

/**
 * Process user input and generate appropriate response
 */
function processChatInput(userMessage, prediction) {
    const userInput = userMessage.toLowerCase().trim();
    
    // Check if user is asking about prediction meaning
    if (userInput.includes('what') && (userInput.includes('mean') || userInput.includes('predict'))) {
        const response = answerCommonQuestion(userInput, prediction);
        return response || generatePredictionExplanation(prediction);
    }
    
    // Check if user is asking about accuracy
    if (userInput.includes('how') && (userInput.includes('accurate') || userInput.includes('reliable'))) {
        return answerCommonQuestion(userInput, prediction);
    }
    
    // Check if user is asking about trust
    if (userInput.includes('can') && (userInput.includes('trust') || userInput.includes('believe'))) {
        return answerCommonQuestion(userInput, prediction);
    }
    
    // Check if user is asking for guidance
    if (userInput.includes('guidance') || userInput.includes('how') && userInput.includes('better')) {
        return answerCommonQuestion(userInput, prediction);
    }
    
    // Check if user is asking about disease
    if (userInput.includes('disease') || userInput.includes('condition')) {
        return getDiseaseGuidance(prediction.predicted_class);
    }
    
    // Check if user is asking for disclaimer
    if (userInput.includes('disclaimer') || userInput.includes('professional') || userInput.includes('medical')) {
        return answerCommonQuestion(userInput, prediction);
    }
    
    // Default response for unmatched questions
    return generateDefaultResponse(prediction);
}

/**
 * Generate default response for unmatched questions
 */
function generateDefaultResponse(prediction) {
    const responses = [
        `I'm here to help! I can explain the prediction of ${prediction.predicted_class}, discuss accuracy, provide guidance for better images, or share important disclaimers. What would you like to know?`,
        `That's a great question! Here's what I can help with:\n✓ Explain what ${prediction.predicted_class} means\n✓ Discuss prediction accuracy and reliability\n✓ Provide tips for better predictions\n✓ Share important medical disclaimers\n\nWhat interests you most?`,
        `I understand! While I'm specialized in explaining this prediction, I'd be happy to help with any of these:\n• Meaning of the results\n• Prediction accuracy\n• How to get better predictions\n• Important disclaimers\n\nWhich would be most helpful?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Get random greeting
 */
function getGreeting() {
    return messageTemplates.greeting[Math.floor(Math.random() * messageTemplates.greeting.length)];
}

/**
 * Get random follow-up prompt
 */
function getFollowUpPrompt() {
    return messageTemplates.followUpPrompts[Math.floor(Math.random() * messageTemplates.followUpPrompts.length)];
}

// ==================== CHATBOT INTERFACE MANAGEMENT ====================

/**
 * Initialize chatbot
 */
function initChatbot() {
    createChatbotWidget();
    attachChatbotEventListeners();
}

/**
 * Create chatbot widget HTML
 */
function createChatbotWidget() {
    const chatbotHTML = `
        <div id="chatbot-widget" class="chatbot-widget">
            <!-- Chatbot Toggle Button -->
            <button id="chatbot-toggle" class="chatbot-toggle" title="Open Chat">
                <span class="chatbot-icon">💬</span>
                <span class="chatbot-badge" id="chatbot-badge" style="display: none;">1</span>
            </button>

            <!-- Chatbot Window -->
            <div id="chatbot-window" class="chatbot-window" style="display: none;">
                <!-- Header -->
                <div class="chatbot-header">
                    <div class="chatbot-title">
                        <span class="chatbot-name">🤖 MediBot</span>
                        <span class="chatbot-status">Online</span>
                    </div>
                    <button id="chatbot-close" class="chatbot-close" title="Close Chat">✕</button>
                </div>

                <!-- Messages Container -->
                <div id="chatbot-messages" class="chatbot-messages"></div>

                <!-- Input Area -->
                <div class="chatbot-input-area">
                    <input 
                        type="text" 
                        id="chatbot-input" 
                        class="chatbot-input" 
                        placeholder="Type your question..."
                        maxlength="500"
                    >
                    <button id="chatbot-send" class="chatbot-send" title="Send Message">📤</button>
                </div>

                <!-- Footer -->
                <div class="chatbot-footer">
                    <p>⚠️ AI-based analysis. Not professional medical advice.</p>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
}

/**
 * Attach event listeners to chatbot
 */
function attachChatbotEventListeners() {
    const toggleBtn = document.getElementById('chatbot-toggle');
    const closeBtn = document.getElementById('chatbot-close');
    const sendBtn = document.getElementById('chatbot-send');
    const input = document.getElementById('chatbot-input');

    toggleBtn.addEventListener('click', toggleChatbot);
    closeBtn.addEventListener('click', closeChatbot);
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

/**
 * Toggle chatbot visibility
 */
function toggleChatbot() {
    const window = document.getElementById('chatbot-window');
    const toggle = document.getElementById('chatbot-toggle');
    
    if (chatbotState.isOpen) {
        closeChatbot();
    } else {
        window.style.display = 'flex';
        toggle.classList.add('active');
        chatbotState.isOpen = true;
        
        // Show greeting if no messages yet
        if (chatbotState.messages.length === 0) {
            addBotMessage(getGreeting());
        }
        
        document.getElementById('chatbot-input').focus();
    }
}

/**
 * Close chatbot
 */
function closeChatbot() {
    const window = document.getElementById('chatbot-window');
    const toggle = document.getElementById('chatbot-toggle');
    
    window.style.display = 'none';
    toggle.classList.remove('active');
    chatbotState.isOpen = false;
}

/**
 * Add bot message to chat
 */
function addBotMessage(message) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chatbot-message bot-message';
    messageDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">${formatMessage(message)}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    chatbotState.messages.push({ sender: 'bot', text: message });
}

/**
 * Add user message to chat
 */
function addUserMessage(message) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chatbot-message user-message';
    messageDiv.innerHTML = `
        <div class="message-content">${message}</div>
        <div class="message-avatar">👤</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    chatbotState.messages.push({ sender: 'user', text: message });
}

/**
 * Send message
 */
function sendMessage() {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();

    if (!message) return;

    // Add user message
    addUserMessage(message);
    input.value = '';

    // Get prediction from page
    const prediction = chatbotState.currentPrediction;
    
    if (!prediction) {
        addBotMessage("Please make a prediction first, and then I can help explain the results!");
        return;
    }

    // Process input and generate response
    const response = processChatInput(message, prediction);
    
    // Add bot response
    setTimeout(() => {
        addBotMessage(response);
        
        // Add follow-up prompt occasionally
        if (Math.random() > 0.5) {
            setTimeout(() => {
                addBotMessage(getFollowUpPrompt());
            }, 500);
        }
    }, 300);
}

/**
 * Format message with markdown
 */
function formatMessage(message) {
    // Convert **text** to <strong>
    message = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert newlines to <br>
    message = message.replace(/\n/g, '<br>');
    
    return message;
}

/**
 * Update chatbot with prediction
 */
function updateChatbotWithPrediction(prediction) {
    chatbotState.currentPrediction = prediction;
    
    if (chatbotState.isOpen) {
        const explanation = generatePredictionExplanation(prediction);
        addBotMessage(explanation);
    }
}

// ==================== INTEGRATION WITH MAIN APP ====================

/**
 * Hook into the main app's displayResults function
 */
function hookIntoPredictionResults() {
    const originalDisplayResults = window.displayResults;
    
    window.displayResults = function(prediction) {
        // Call original function
        originalDisplayResults.call(this, prediction);
        
        // Update chatbot
        updateChatbotWithPrediction(prediction);
    };
}

// ==================== INITIALIZATION ====================

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initChatbot();
    hookIntoPredictionResults();
});