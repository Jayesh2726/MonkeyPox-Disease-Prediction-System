// Disease Precautions Database
// This file contains comprehensive health precautions and guidelines for various skin conditions

const diseasePrecautions = {
    'Measles': {
        warning: 'Measles is a highly contagious viral infection.',
        precautions: [
            'Maintain proper vaccination status - MMR vaccine is highly effective',
            'Keep hands clean and wash frequently with soap and water',
            'Avoid touching face, eyes, nose, and mouth',
            'Maintain respiratory hygiene by covering coughs and sneezes',
            'Ensure proper ventilation in living spaces',
            'Eat healthy foods rich in vitamins A, C, and D to boost immunity',
            'Get adequate sleep (7-9 hours) to support immune function',
            'Avoid sharing personal items like towels, utensils, and cups',
            'Keep living spaces clean and disinfected',
            'Consult a healthcare professional immediately if symptoms appear'
        ]
    },
    'Monkeypox': {
        warning: 'Monkeypox is a viral infection that spreads through direct contact.',
        precautions: [
            'Practice good personal hygiene and wash hands regularly',
            'Avoid direct contact with infected individuals or their lesions',
            'Do not share clothing, towels, or bedding',
            'Maintain clean and hygienic living and working environments',
            'Eat nutritious foods with balanced nutrients to support immunity',
            'Stay hydrated by drinking plenty of water',
            'Get regular physical activity to strengthen immune system',
            'Avoid touching animals or animal products from unknown sources',
            'Keep cuts and wounds covered and clean',
            'Seek immediate medical attention if symptoms develop'
        ]
    },
    'Chickenpox': {
        warning: 'Chickenpox is a highly contagious viral infection.',
        precautions: [
            'Ensure vaccination with varicella vaccine for prevention',
            'Maintain strict hand hygiene to prevent spreading infection',
            'Keep fingernails short to avoid scratching lesions',
            'Isolate from others if infected to prevent transmission',
            'Keep skin clean with gentle bathing in lukewarm water',
            'Eat healthy, nutrient-rich foods to support recovery',
            'Consume foods rich in vitamin C for immune support',
            'Drink adequate water and fluids for hydration',
            'Get adequate rest and sleep for faster recovery',
            'Wear clean, loose-fitting clothes to prevent irritation',
            'Use prescribed medications as directed by healthcare provider'
        ]
    },
    'Normal': {
        warning: 'Your skin appears to be in normal, healthy condition.',
        precautions: [
            'Continue maintaining good personal hygiene practices',
            'Wash hands regularly with soap and water for at least 20 seconds',
            'Keep your living spaces clean and well-organized',
            'Maintain a balanced diet rich in fruits and vegetables',
            'Stay hydrated by drinking 7-8 glasses of water daily',
            'Get regular physical exercise (at least 30 minutes daily)',
            'Ensure proper sleep and rest (7-9 hours per night)',
            'Protect skin from excessive sun exposure with sunscreen',
            'Avoid sharing personal items like towels and razors',
            'Keep vaccinations up to date as recommended by healthcare providers'
        ]
    }
};

// Function to display precautions
function displayPrecautions(disease) {
    const precautionsSection = document.getElementById('precautionsSection');
    if (!precautionsSection) {
        console.error('Precautions section element not found');
        return;
    }

    precautionsSection.innerHTML = '';

    const diseaseInfo = diseasePrecautions[disease] || diseasePrecautions['Normal'];

    let html = `
        <div class="disease-warning">
            ⚠️ <strong>${diseaseInfo.warning}</strong>
        </div>
        <h3>🛡️ Recommended Precautions & Health Guidelines</h3>
        <ul>
    `;

    diseaseInfo.precautions.forEach(precaution => {
        html += `<li>${precaution}</li>`;
    });

    html += `
        </ul>
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #d0d7ff; font-size: 0.9em; color: #666;">
            <strong>💡 Important Note:</strong> This prediction is based on image analysis. Please consult with a healthcare professional for proper diagnosis and treatment. This tool is for informational purposes only and should not replace professional medical advice.
        </div>
    `;

    precautionsSection.innerHTML = html;
}

// Function to print result
function printResult() {
    window.print();
}

// Function to download result as PDF with image
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
            const warningText = pdf.splitTextToSize(`⚠️ Warning: ${diseaseInfo.warning}`, pageWidth - 40);
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