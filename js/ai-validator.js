// AI Image Validation using Google Cloud Vision API

class AIImageValidator {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.apiUrl = CONFIG.VISION_API_URL;
    }

    /**
     * Convert image file to base64 string
     */
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Validate image using Google Cloud Vision API
     * Returns: { valid: boolean, reason: string, labels: array }
     */
    async validateImage(file) {
        try {
            // Convert image to base64
            const base64Image = await this.fileToBase64(file);

            // Prepare API request
            const requestBody = {
                requests: [
                    {
                        image: {
                            content: base64Image
                        },
                        features: [
                            {
                                type: 'LABEL_DETECTION',
                                maxResults: 20
                            },
                            {
                                type: 'SAFE_SEARCH_DETECTION'
                            }
                        ]
                    }
                ]
            };

            // Call Vision API
            const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.responses && data.responses[0]) {
                const result = data.responses[0];

                // Check for safe search violations
                const safeSearch = result.safeSearchAnnotation;
                if (safeSearch) {
                    if (
                        safeSearch.adult === 'LIKELY' ||
                        safeSearch.adult === 'VERY_LIKELY' ||
                        safeSearch.violence === 'LIKELY' ||
                        safeSearch.violence === 'VERY_LIKELY' ||
                        safeSearch.racy === 'VERY_LIKELY'
                    ) {
                        return {
                            valid: false,
                            reason: 'Image contains inappropriate content',
                            labels: []
                        };
                    }
                }

                // Check labels
                const labels = result.labelAnnotations || [];
                const detectedLabels = labels.map(l => ({
                    description: l.description.toLowerCase(),
                    score: l.score
                }));

                // Check if any detected label matches our whitelist
                const matchedLabels = detectedLabels.filter(label =>
                    CONFIG.ALLOWED_LABELS.some(allowed =>
                        label.description.includes(allowed.toLowerCase()) ||
                        allowed.toLowerCase().includes(label.description)
                    ) && label.score >= CONFIG.MIN_CONFIDENCE
                );

                if (matchedLabels.length > 0) {
                    return {
                        valid: true,
                        reason: 'Image approved',
                        labels: matchedLabels.map(l => l.description)
                    };
                } else {
                    return {
                        valid: false,
                        reason: 'Only sky and nature photos are allowed',
                        labels: detectedLabels.map(l => l.description)
                    };
                }
            }

            throw new Error('Invalid API response');

        } catch (error) {
            console.error('Validation error:', error);
            return {
                valid: false,
                reason: `Validation failed: ${error.message}`,
                labels: []
            };
        }
    }

    /**
     * Quick validation for file type and size
     */
    validateFile(file) {
        // Check file type
        if (!CONFIG.ALLOWED_FORMATS.includes(file.type)) {
            return {
                valid: false,
                reason: 'Invalid file format. Please upload JPG, PNG, or WebP images.'
            };
        }

        // Check file size
        if (file.size > CONFIG.MAX_FILE_SIZE) {
            return {
                valid: false,
                reason: `File too large. Maximum size is ${CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB.`
            };
        }

        return { valid: true };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIImageValidator;
}
