// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const fileName = document.getElementById('fileName');
const resultsContainer = document.getElementById('resultsContainer');
const errorMessage = document.getElementById('errorMessage');
const loadingSection = document.getElementById('loadingSection');

// ==================== EVENT LISTENERS ====================

// Click to upload
uploadArea.addEventListener('click', () => fileInput.click());

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        handleFileSelect();
    }
});

// File selection
fileInput.addEventListener('change', handleFileSelect);

// ==================== FUNCTIONS ====================

/**
 * Handle file selection and display filename
 */
function handleFileSelect() {
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        fileName.textContent = `Selected: ${file.name}`;
    }
}

/**
 * Display error message
 */
function showError(message) {
    const errorMsg = message || 'An unknown error occurred.';
    errorMessage.textContent = typeof errorMsg === 'string' ? errorMsg : 'An unknown error occurred.';
    errorMessage.classList.add('show');
}

/**
 * Clear error message
 */
function clearError() {
    errorMessage.classList.remove('show');
    errorMessage.textContent = '';
}

/**
 * Display prediction results
 */
function displayResults(prediction) {
    // Validate prediction object
    if (!prediction || typeof prediction !== 'object') {
        showError('Invalid prediction data received.');
        return;
    }

    // Display uploaded image
    if (fileInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('uploadedImage').src = e.target.result;
        };
        reader.readAsDataURL(fileInput.files[0]);
    }

    // Display predicted class
    const predictedClass = prediction.predicted_class || 'Unknown';
    const confidence = prediction.confidence !== undefined ? prediction.confidence : 'N/A';
    
    document.getElementById('topPrediction').textContent = predictedClass;
    document.getElementById('confidenceScore').textContent = confidence + '%';

    // Display all class probabilities
    const allPredictionsDiv = document.getElementById('allPredictions');
    allPredictionsDiv.innerHTML = '';

    const probabilities = prediction.class_probabilities || {};
    
    if (Object.keys(probabilities).length === 0) {
        allPredictionsDiv.innerHTML = '<p>No probability data available.</p>';
    } else {
        for (const [disease, conf] of Object.entries(probabilities)) {
            const predictionBar = document.createElement('div');
            predictionBar.className = 'prediction-bar';
            const confValue = conf !== undefined ? conf : 0;
            predictionBar.innerHTML = `
                <div class="prediction-label">
                    <span>${disease}</span>
                    <span>${confValue}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${confValue}%"></div>
                </div>
            `;
            allPredictionsDiv.appendChild(predictionBar);
        }
    }

    // Display precautions
    displayPrecautions(predictedClass);

    resultsContainer.classList.add('show');
}

// ==================== PREDICTION ====================

/**
 * Handle prediction button click
 */
uploadBtn.addEventListener('click', async () => {
    if (fileInput.files.length === 0) {
        showError('Please select an image first.');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    uploadBtn.disabled = true;
    loadingSection.classList.add('show');
    clearError();
    resultsContainer.classList.remove('show');

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            body: formData
        });

        let data = null;
        try {
            data = await response.json();
        } catch (jsonError) {
            showError('Invalid response from server. Please try again.');
            loadingSection.classList.remove('show');
            uploadBtn.disabled = false;
            return;
        }

        loadingSection.classList.remove('show');

        if (data && data.success) {
            displayResults(data.prediction);
        } else if (data && data.error) {
            showError(data.error);
        } else {
            showError('An error occurred during prediction.');
        }
    } catch (error) {
        loadingSection.classList.remove('show');
        showError('Network error: ' + error.message);
        console.error('Prediction error:', error);
    } finally {
        uploadBtn.disabled = false;
    }
});

// ==================== EXPORT FUNCTIONS ====================

/**
 * Print the prediction report
 */
function printResult() {
    window.print();
}

/**
 * Download prediction report as PDF
 */
function downloadPDF() {
    try {
        const predictedClass = document.getElementById('topPrediction').textContent;
        const confidence = document.getElementById('confidenceScore').textContent;
        const timestamp = new Date().toLocaleString();
        const uploadedImageElement = document.getElementById('uploadedImage');

        if (!uploadedImageElement || !uploadedImageElement.src) {
            alert('Please upload an image first');
            return;
        }

        // Get image data
        const canvas = document.createElement('canvas');
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const imgData = canvas.toDataURL('image/jpeg', 0.9);

            // Create PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            let yPosition = 15;

            // Title
            pdf.setFontSize(18);
            pdf.setTextColor(102, 126, 234);
            pdf.text('SKIN DISEASE PREDICTION REPORT', pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 8;

            // Subtitle
            pdf.setFontSize(10);
            pdf.setTextColor(100, 100, 100);
            pdf.text('AI-Powered Medical Image Analysis', pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 6;

            pdf.setTextColor(150, 150, 150);
            pdf.setFontSize(9);
            pdf.text(`Generated: ${timestamp}`, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 10;

            // Separator line
            pdf.setDrawColor(102, 126, 234);
            pdf.line(15, yPosition, pageWidth - 15, yPosition);
            yPosition += 8;

            // Image section
            pdf.setFontSize(12);
            pdf.setTextColor(51, 51, 51);
            pdf.text('UPLOADED IMAGE', 15, yPosition);
            yPosition += 8;

            // Add image (maintaining aspect ratio)
            const imgWidth = pageWidth - 30;
            const imgHeight = (img.height / img.width) * imgWidth;
            
            if (yPosition + imgHeight > pageHeight - 20) {
                pdf.addPage();
                yPosition = 15;
            }

            pdf.addImage(imgData, 'JPEG', 15, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 10;

            // Prediction Result section
            if (yPosition > pageHeight - 50) {
                pdf.addPage();
                yPosition = 15;
            }

            pdf.setFillColor(240, 244, 255);
            pdf.rect(15, yPosition, pageWidth - 30, 30, 'F');
            pdf.setFontSize(12);
            pdf.setTextColor(102, 126, 234);
            pdf.text('PREDICTION RESULT', 18, yPosition + 6);
            
            pdf.setFontSize(11);
            pdf.setTextColor(80, 80, 80);
            pdf.text(`Predicted Disease: ${predictedClass}`, 18, yPosition + 16);
            pdf.setTextColor(40, 167, 69);
            pdf.text(`Confidence: ${confidence}`, 18, yPosition + 25);
            yPosition += 35;

            // Detailed Analysis
            if (yPosition > pageHeight - 50) {
                pdf.addPage();
                yPosition = 15;
            }

            pdf.setFontSize(12);
            pdf.setTextColor(51, 51, 51);
            pdf.text('DETAILED ANALYSIS', 15, yPosition);
            yPosition += 8;

            // Add probability bars
            const probBars = document.querySelectorAll('.prediction-bar');
            probBars.forEach(bar => {
                if (yPosition > pageHeight - 20) {
                    pdf.addPage();
                    yPosition = 15;
                }

                const label = bar.querySelector('.prediction-label span:first-child').textContent;
                const score = bar.querySelector('.prediction-label span:last-child').textContent;
                const scoreValue = parseFloat(score);

                pdf.setFontSize(10);
                pdf.setTextColor(80, 80, 80);
                pdf.text(`${label}: ${score}`, 20, yPosition);

                // Progress bar
                pdf.setDrawColor(200, 200, 200);
                pdf.rect(80, yPosition - 3, 80, 4);
                pdf.setFillColor(102, 126, 234);
                const barWidth = (scoreValue / 100) * 80;
                pdf.rect(80, yPosition - 3, barWidth, 4, 'F');

                yPosition += 8;
            });

            yPosition += 5;

            // Precautions section
            if (yPosition > pageHeight - 80) {
                pdf.addPage();
                yPosition = 15;
            }

            const diseaseInfo = diseasePrecautions[predictedClass] || diseasePrecautions['Normal'];
            
            pdf.setFillColor(240, 255, 240);
            pdf.rect(15, yPosition, pageWidth - 30, 8, 'F');
            pdf.setFontSize(12);
            pdf.setTextColor(40, 167, 69);
            pdf.text('PRECAUTIONS & HEALTH GUIDELINES', 18, yPosition + 6);
            yPosition += 12;

            // Warning box
            pdf.setFillColor(255, 243, 205);
            pdf.rect(15, yPosition, pageWidth - 30, 15, 'F');
            pdf.setFontSize(9);
            pdf.setTextColor(133, 100, 4);
            const warningText = pdf.splitTextToSize(`Warning: ${diseaseInfo.warning}`, pageWidth - 40);
            pdf.text(warningText, 18, yPosition + 5);
            yPosition += 18;

            // Precautions list
            pdf.setFontSize(10);
            pdf.setTextColor(80, 80, 80);
            diseaseInfo.precautions.forEach((precaution, index) => {
                if (yPosition > pageHeight - 20) {
                    pdf.addPage();
                    yPosition = 15;
                }

                const precautionText = pdf.splitTextToSize(`${index + 1}. ${precaution}`, pageWidth - 40);
                pdf.text(precautionText, 20, yPosition);
                yPosition += 5 * precautionText.length + 2;
            });

            // Add disclaimer at end
            pdf.addPage();
            yPosition = 15;

            pdf.setFillColor(231, 243, 255);
            pdf.rect(15, yPosition, pageWidth - 30, 40, 'F');
            pdf.setFontSize(11);
            pdf.setTextColor(33, 150, 243);
            pdf.text('IMPORTANT DISCLAIMER', 18, yPosition + 6);
            
            pdf.setFontSize(9);
            pdf.setTextColor(80, 80, 80);
            const disclaimerText = pdf.splitTextToSize(
                'This prediction is based on AI image analysis only. Please consult with a qualified healthcare professional for proper diagnosis. This tool should not replace professional medical advice.',
                pageWidth - 40
            );
            pdf.text(disclaimerText, 18, yPosition + 15);

            yPosition += 45;
            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            pdf.text(`Report Generated: ${timestamp}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

            // Save PDF
            pdf.save(`Disease_Prediction_Report_${Date.now()}.pdf`);
        };

        img.onerror = function() {
            alert('Could not load image for PDF. Please try again.');
        };

        img.src = uploadedImageElement.src;

    } catch (error) {
        console.error('PDF Error:', error);
        alert('Error generating PDF: ' + error.message);
    }
}

/**
 * Download prediction report as text file
 */
function downloadResult() {
    const predictedClass = document.getElementById('topPrediction').textContent;
    const confidence = document.getElementById('confidenceScore').textContent;
    const timestamp = new Date().toLocaleString();

    let content = `
SKIN DISEASE PREDICTION REPORT
=====================================
Generated: ${timestamp}

PREDICTION RESULT:
Disease: ${predictedClass}
Confidence: ${confidence}

DETAILED ANALYSIS:
`;

    // Add all probabilities
    const probBars = document.querySelectorAll('.prediction-bar');
    probBars.forEach(bar => {
        const label = bar.querySelector('.prediction-label span:first-child').textContent;
        const score = bar.querySelector('.prediction-label span:last-child').textContent;
        content += `${label}: ${score}\n`;
    });

    content += `

HEALTH PRECAUTIONS & GUIDELINES:
=====================================
`;

    const diseaseInfo = diseasePrecautions[predictedClass] || diseasePrecautions['Normal'];
    content += `${diseaseInfo.warning}\n\n`;
    content += `Recommended Actions:\n`;
    diseaseInfo.precautions.forEach((precaution, index) => {
        content += `${index + 1}. ${precaution}\n`;
    });

    content += `

IMPORTANT DISCLAIMER:
=====================================
This prediction is based on image analysis using artificial intelligence. 
Please consult with a qualified healthcare professional for:
- Proper medical diagnosis
- Professional treatment recommendations
- Medical advice and guidance

This tool is for informational purposes only and should not replace professional medical advice.

Date: ${timestamp}
`;

    // Create and download file
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `disease_prediction_${Date.now()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
