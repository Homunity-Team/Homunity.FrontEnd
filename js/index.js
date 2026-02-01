document.addEventListener('DOMContentLoaded', function() {
    
    const searchbtn = document.getElementById('searchbtn');
    const resultsContainer = document.getElementById('resultsContainer');

    searchbtn.addEventListener('click', async function() {
        
        const loc = document.getElementById('Locationinput').value;
        const type = document.getElementById('typeSelect').value;
        const Budget = document.getElementById('Budgetinput').value;

        resultsContainer.innerHTML = "<p class='text-center'>Searching for properties...</p>";

        try {
          const response= await fetch(`https://api.example.com/filter?location=${loc}&type=${type}&price=${budget}`);
         
            const data = await response.json(); 

            displayResults(data);

        } catch (error) {
            console.error("Error:", error);
            resultsContainer.innerHTML = "<p class='text-danger'>Something went wrong. Please try again.</p>";
        }
    });
    function displayResults(properties) {
        resultsContainer.innerHTML = ""; 

        if (properties.length === 0) {
            resultsContainer.innerHTML = "<p class='text-center'>No properties found!</p>";
            return;
        }
        properties.forEach(prop => {
            const card = `
                <div class="col-md-4">
                    <div class="property-card">
                        <img src="${prop.image}" class="img-fluid rounded mb-2" alt="property">
                        <h6>${prop.title}</h6>
                        <p class="text-muted">${prop.location}</p>
                        <strong style="color: #c9a333;">$${prop.price}</strong>
                    </div>
                </div>
            `;
            resultsContainer.innerHTML += card;
        });
    }
});