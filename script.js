//example code to test the button & output
// Function called when button is clicked
function generateScore() {
    let totalScore = 0;
    let answeredCount = 0;
    
    // Get all select dropdowns
    const selects = document.querySelectorAll('select');
    
    selects.forEach(select => {
        const value = parseInt(select.value);
        if (!isNaN(value) && value > 0) {
            totalScore += value;
            answeredCount++;
        }
    });
    
    // Get all radio button groups
    const radioGroups = ['modularity', 'maintainability', 'reliability', 'performance', 
                         'scalability', 'security', 'usability', 'interoperability', 
                         'testability', 'portability'];
    
    radioGroups.forEach(groupName => {
        const checkedRadio = document.querySelector(`input[name="${groupName}"]:checked`);
        if (checkedRadio) {
            totalScore += parseInt(checkedRadio.value);
            answeredCount++;
        }
    });
    
    // Calculate and display result
    if (answeredCount === 0) {
        alert('Please answer at least one question.');
    } else {
        const maxPossible = answeredCount * 10;
        const percentage = ((totalScore / maxPossible) * 100).toFixed(1);
        alert(`Quantitative Design Score (QDS):\n\nTotal Score: ${totalScore} out of ${maxPossible}\nPercentage: ${percentage}%\nQuestions Answered: ${answeredCount}`);
    }
}