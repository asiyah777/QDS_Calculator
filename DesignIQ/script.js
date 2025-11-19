const attributes = [
    { name: 'modularity', weight: 0, normalizedWeight: 0, rating: 0, product: 0 },
    { name: 'maintainability', weight: 0, normalizedWeight: 0, rating: 0, product: 0 },
    { name: 'reliability', weight: 0, normalizedWeight: 0, rating: 0, product: 0 },
    { name: 'performance', weight: 0, normalizedWeight: 0, rating: 0, product: 0 },
    { name: 'scalability', weight: 0, normalizedWeight: 0, rating: 0, product: 0 },
    { name: 'security', weight: 0, normalizedWeight: 0, rating: 0, product: 0 },
    { name: 'usability', weight: 0, normalizedWeight: 0, rating: 0, product: 0 },
    { name: 'interoperability', weight: 0, normalizedWeight: 0, rating: 0, product: 0 },
    { name: 'testability', weight: 0, normalizedWeight: 0, rating: 0, product: 0 },
    { name: 'portability', weight: 0, normalizedWeight: 0, rating: 0, product: 0 }
];

// Function called when button is clicked
function generateScore() {
    let totalWeight = 0;
    let answeredCount = 0;
    
    // Get all radio button groups
    const radioGroups = ['modularity', 'maintainability', 'reliability', 'performance', 
                         'scalability', 'security', 'usability', 'interoperability', 
                         'testability', 'portability'];
    
    radioGroups.forEach((groupName, index) => {
        const checkedRadio = document.querySelector(`input[name="${groupName}_weight"]:checked`);
        if (checkedRadio) {
            totalWeight += parseInt(checkedRadio.value);
            attributes[index].name = groupName;
            attributes[index].weight = parseInt(checkedRadio.value);
        } else {
            attributes[index].weight = 0;
        }
    });

    // Get all select dropdowns (ratings)
    const selects = document.querySelectorAll('select');
    
    selects.forEach((select, index) => {
        const rating = parseInt(select.value);
        if (!isNaN(rating) && rating > 0) {
            attributes[index].rating = rating;
            answeredCount++;
        }
    });
    
    // Calculate and display result
    if (totalWeight === 0 || answeredCount === 0) {
        alert('Please answer at least one question fully.');
    } else {
        // Normalize weights for each attribute
        attributes.forEach((attr) => {
            attr.normalizedWeight = attr.weight / totalWeight;
        });
        // Check normalized weights sum to 1
        const weightSum = attributes.reduce((sum, attr) => sum + attr.normalizedWeight, 0);
        if (weightSum.toFixed(5) !== '1.00000') {
            alert('Normalized weights do not sum to 1:', weightSum);
        }
        // Calculate products of normalized weights and scores
        attributes.forEach(attr => {
            attr.product = attr.normalizedWeight * attr.rating;
        });
        // Final QDS calculation
        let finalQDS = attributes.reduce((sum, attr) => sum + attr.product, 0).toFixed(2);
        if (parseFloat(finalQDS) === 0) {
            alert('Final QDS is 0. Please ensure one question is fully answered.');
            return;
        }
        alert(`Final QDS: ${finalQDS}`);
    }
}