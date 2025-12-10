const attributes = [
    {
        key: 'modularity',
        label: 'Modularity',
        suggestion:
            'Increase separation between components, define clear interfaces, and reduce hidden dependencies so changes in one module have minimal ripple effects.'
    },
    {
        key: 'maintainability',
        label: 'Maintainability',
        suggestion:
            'Improve coding standards, documentation, and automated tests so future changes are easier and safer to apply.'
    },
    {
        key: 'reliability',
        label: 'Reliability',
        suggestion:
            'Add monitoring, better error handling, and redundancy for critical components to reduce runtime failures.'
    },
    {
        key: 'performance',
        label: 'Performance / Efficiency',
        suggestion:
            'Profile the system to find bottlenecks, then optimize hot paths, database queries, and caching where it matters most.'
    },
    {
        key: 'scalability',
        label: 'Scalability',
        suggestion:
            'Consider stateless services, load balancing, and data partitioning to handle higher load without major redesign.'
    },
    {
        key: 'security',
        label: 'Security',
        suggestion:
            'Strengthen authentication, authorization, encryption, and perform regular security reviews and testing.'
    },
    {
        key: 'usability',
        label: 'Usability',
        suggestion:
            'Run usability tests, simplify workflows, and make key actions more discoverable and consistent for users.'
    },
    {
        key: 'interoperability',
        label: 'Interoperability',
        suggestion:
            'Adopt standard protocols and well-documented APIs so other systems can integrate with minimal friction.'
    },
    {
        key: 'testability',
        label: 'Testability',
        suggestion:
            'Refactor into smaller, loosely coupled components with clear contracts so automated tests are easier to write and maintain.'
    },
    {
        key: 'portability',
        label: 'Portability',
        suggestion:
            'Abstract platform-specific details and rely on cross-platform tools so deployment to new environments is smoother.'
    }
];

let hasGenerated = false; // after first click, changes auto-update the score

// Check whether all weights and all question responses are filled in
function isFormComplete() {
    // Check weights
    for (const attr of attributes) {
        const weightRadio = document.querySelector(`input[name="${attr.key}_weight"]:checked`);
        if (!weightRadio) {
            return false;
        }
    }

    // Check questions (2 per attribute)
    for (const attr of attributes) {
        for (let q = 1; q <= 2; q++) {
            const qRadio = document.querySelector(`input[name="${attr.key}_q${q}"]:checked`);
            if (!qRadio) {
                return false;
            }
        }
    }

    return true;
}

// Compute QDS and per-attribute scores
function computeScores() {
    let totalWeight = 0;
    const weights = [];
    const attributeScores = []; // per-attribute score on 0–10 scale

    // Collect weights
    for (const attr of attributes) {
        const weightRadio = document.querySelector(`input[name="${attr.key}_weight"]:checked`);
        const weight = weightRadio ? parseInt(weightRadio.value, 10) : 0;
        weights.push(weight);
        totalWeight += weight;
    }

    if (totalWeight === 0) {
        return null;
    }

    // Compute normalized weights and attribute scores
    let qdsSum = 0;

    attributes.forEach((attr, index) => {
        // Questions (Likert 1–5)
        const q1 = parseInt(
            document.querySelector(`input[name="${attr.key}_q1"]:checked`).value,
            10
        );
        const q2 = parseInt(
            document.querySelector(`input[name="${attr.key}_q2"]:checked`).value,
            10
        );

        const avgLikert = (q1 + q2) / 2; // range 1–5

        // Convert 1–5 Likert to 0–10 scale:
        // 1 -> 0, 3 -> 5, 5 -> 10
        const attrScore0to10 = (avgLikert - 1) * 2.5;

        const normalizedWeight = weights[index] / totalWeight;
        qdsSum += normalizedWeight * attrScore0to10;

        attributeScores.push(attrScore0to10);
    });

    return {
        qds: qdsSum,
        attributeScores
    };
}

// Update the UI with computed scores
function renderResults() {
    const result = computeScores();
    if (!result) return;

    const { qds, attributeScores } = result;

    const qdsValueEl = document.getElementById('qds-value');
    const indicatorEl = document.getElementById('qds-indicator');
    const strongEl = document.getElementById('strong-attributes');
    const weakEl = document.getElementById('weak-attributes');
    const suggestionsEl = document.getElementById('suggestions');
    const resultsContainer = document.getElementById('results');

    // Show results area
    resultsContainer.style.display = 'block';

    // Overall QDS value
    const qdsRounded = Math.max(0, Math.min(10, qds));
    qdsValueEl.textContent = qdsRounded.toFixed(2);

    // Position arrow on gradient (0–10 -> 0–100%)
    const indicatorWrapper = document.getElementById('qds-indicator-wrapper');
    const percentage = (qdsRounded / 10) * 100;
    indicatorWrapper.style.left = `${percentage}%`;


    // Strongest / weakest attributes
    let maxScore = -Infinity;
    let minScore = Infinity;

    attributeScores.forEach(score => {
        if (score > maxScore) maxScore = score;
        if (score < minScore) minScore = score;
    });

    const EPS = 1e-6;
    const strongest = [];
    const weakest = [];

    attributeScores.forEach((score, idx) => {
        if (Math.abs(score - maxScore) < EPS) {
            strongest.push(attributes[idx].label);
        }
        if (Math.abs(score - minScore) < EPS) {
            weakest.push(attributes[idx].label);
        }
    });

    strongEl.textContent = strongest.join(', ');
    weakEl.textContent = weakest.join(', ');

    // Suggestions for weak attributes
    suggestionsEl.innerHTML = '<h3>Recommendations:</h3>';
    weakest.forEach(weakLabel => {
        const attr = attributes.find(a => a.label === weakLabel);
        if (!attr) return;
        const p = document.createElement('p');
        p.innerHTML = `${attr.suggestion}`;
        suggestionsEl.appendChild(p);
    });
}

// Handle changes on any radio button
function handleInputChange() {
    const generateBtn = document.getElementById('generate-btn');
    const complete = isFormComplete();

    // Button only works when everything is filled
    generateBtn.disabled = false;

    // After first score is generated, dynamically update when inputs change
    if (hasGenerated && complete) {
        renderResults();
    }
}

// Handle the "Generate" button click
function handleGenerateClick(event) {
    event.preventDefault();

    if (!isFormComplete()) {
        alert("Please fill in all fields to generate the design score.");
        return;
    }

    hasGenerated = true;
    renderResults();

    const resultsContainer = document.getElementById('results');
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}


// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    const allRadios = document.querySelectorAll('input[type="radio"]');
    allRadios.forEach(radio => {
        radio.addEventListener('change', handleInputChange);
    });

    const generateBtn = document.getElementById('generate-btn');
    generateBtn.addEventListener('click', handleGenerateClick);

    // Initial state
    handleInputChange();
});
