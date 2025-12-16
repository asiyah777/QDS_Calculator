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

// after first score generation, changes auto-update the score
let hasGenerated = false;

// store which fields were incomplete on last attempt
let lastIncompleteFieldNames = [];

// confetti near the Generate button
function fireConfettiNearElement(el) {
    if (typeof confetti !== 'function' || !el) return;

    const rect = el.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = Math.max(0, (rect.top + rect.height * 0.15) / window.innerHeight);

    const base = {
        particleCount: 220,
        spread: 85,
        startVelocity: 55,
        ticks: 220,
        gravity: 1.05,
        scalar: 1.25,
        origin: { x, y },
        zIndex: 9999
    };

    confetti({ ...base, angle: 90, spread: 95 });
    confetti({ ...base, angle: 60, spread: 75, particleCount: 160 });
    confetti({ ...base, angle: 120, spread: 75, particleCount: 160 });
}

// clear error visualizer
function clearValidationErrors() {
    const errored = document.querySelectorAll('.field-error');
    errored.forEach(el => el.classList.remove('field-error'));
}

// collect all incomplete radios
function getIncompleteFields() {
    const incompleteFields = [];
    const incompleteNames = new Set();

    for (const attr of attributes) {
        const weightRadios = document.querySelectorAll(`input[name="${attr.key}_weight"]`);
        const weightSelected = document.querySelector(`input[name="${attr.key}_weight"]:checked`);
        if (!weightSelected) {
            weightRadios.forEach(r => incompleteFields.push(r));
            incompleteNames.add(`${attr.key}_weight`);
        }
    }

    for (const attr of attributes) {
        for (let q = 1; q <= 2; q++) {
            const name = `${attr.key}_q${q}`;
            const questionRadios = document.querySelectorAll(`input[name="${name}"]`);
            const selected = document.querySelector(`input[name="${name}"]:checked`);
            if (!selected) {
                questionRadios.forEach(r => incompleteFields.push(r));
                incompleteNames.add(name);
            }
        }
    }

    lastIncompleteFieldNames = Array.from(incompleteNames);
    return incompleteFields;
}

function isFormComplete() {
    return getIncompleteFields().length === 0;
}

// Compute QDS and per-attribute scores
function computeScores() {
    let totalWeight = 0;
    const weights = [];
    const attributeScores = [];

    for (const attr of attributes) {
        const weightRadio = document.querySelector(`input[name="${attr.key}_weight"]:checked`);
        const weight = weightRadio ? parseInt(weightRadio.value, 10) : 0;
        weights.push(weight);
        totalWeight += weight;
    }

    if (totalWeight === 0) {
        return null;
    }

    let qdsSum = 0;

    attributes.forEach((attr, index) => {
        const q1 = parseInt(
            document.querySelector(`input[name="${attr.key}_q1"]:checked`).value,
            10
        );
        const q2 = parseInt(
            document.querySelector(`input[name="${attr.key}_q2"]:checked`).value,
            10
        );

        // score each attribute the average of its 2 questions
        const avgLikert = (q1 + q2) / 2;

        // Convert 1–5 Likert to 0–10 scale:
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

    resultsContainer.style.display = 'block';

    const qdsRounded = Math.max(0, Math.min(10, qds));
    qdsValueEl.textContent = qdsRounded.toFixed(2);

    // Position arrow on gradient scale (0–10 -> 0–100%)
    const indicatorWrapper = document.getElementById('qds-indicator-wrapper');
    const percentage = (qdsRounded / 10) * 100;
    indicatorWrapper.style.left = `${percentage}%`;


    // Build per-attribute entries with labels, suggestions, and scores
    const attributeScoreEntries = attributes.map((attr, idx) => ({
        key: attr.key,
        label: attr.label,
        suggestion: attr.suggestion,
        score: attributeScores[idx]
    }));

    let maxScore = -Infinity;
    let minScore = Infinity;

    attributeScoreEntries.forEach(entry => {
        if (entry.score > maxScore) maxScore = entry.score;
        if (entry.score < minScore) minScore = entry.score;
    });

    const EPS = 1e-6;
    const allEqual = Math.abs(maxScore - minScore) < EPS;

    if (allEqual) {
        strongEl.textContent = 'All attributes are tied (no single strongest attribute).';
        weakEl.textContent = 'All attributes are tied (no single weakest attribute).';
    } else {
        const strongest = attributeScoreEntries
            .filter(entry => Math.abs(entry.score - maxScore) < EPS)
            .map(entry => entry.label);

        const weakest = attributeScoreEntries
            .filter(entry => Math.abs(entry.score - minScore) < EPS)
            .map(entry => entry.label);

        strongEl.textContent = strongest.join(', ');
        weakEl.textContent = weakest.join(', ');
    }

    // Clear any previous suggestions
    suggestionsEl.innerHTML = '';

    // Gather all question answers to detect edge cases
    const allQuestionRadios = [];
    attributes.forEach(attr => {
        for (let q = 1; q <= 2; q++) {
            const r = document.querySelector(`input[name="${attr.key}_q${q}"]:checked`);
            if (r) {
                allQuestionRadios.push(r);
            }
        }
    });

    const allAgree =
        allQuestionRadios.length > 0 &&
        allQuestionRadios.every(r => r.value === '5');

    const allDisagree =
        allQuestionRadios.length > 0 &&
        allQuestionRadios.every(r => r.value === '1');

    if (allAgree) {
        // Everything rated as highest: do not spam recommendations
        suggestionsEl.innerHTML =
            '<p>You rated every aspect at the highest level. No specific improvement suggestions were generated.</p>';
        return;
    }

    if (allDisagree) {
        // Everything rated as lowest: give a single global recommendation
        suggestionsEl.innerHTML =
            '<p>You rated every aspect at the lowest level. Consider revisiting your architecture from the ground up, as all quality attributes currently appear weak.</p>';
        return;
    }

    if (allEqual) {
        return;
    }

    // only show suggestions for attributes that are strictly below the best score
    const suggestionsList = attributeScoreEntries.filter(entry => entry.score < maxScore - EPS);

    if (suggestionsList.length > 0) {
        const header = document.createElement('h3');
        header.textContent = 'Recommendations:';
        suggestionsEl.appendChild(header);

        suggestionsList.forEach(entry => {
            const p = document.createElement('p');
            p.innerHTML = entry.suggestion;
            suggestionsEl.appendChild(p);
        });
    }
}

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

function handleGenerateClick(event) {
    event.preventDefault();
    clearValidationErrors();

    const incompleteFields = getIncompleteFields();

    if (incompleteFields.length > 0) {
        incompleteFields.forEach(el => el.classList.add('field-error'));

        alert("Please fill in all fields to generate the design score.");
        return;
    }

    hasGenerated = true;
    renderResults();

    const result = computeScores();
    if (result && result.qds >= 7) {
        const resultsEl = document.getElementById('results');
        const targetEl = (resultsEl && resultsEl.style.display !== 'none') ? resultsEl : document.getElementById('generate-btn');
        fireConfettiNearElement(targetEl);
    }
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