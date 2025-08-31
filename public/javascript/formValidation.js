document.addEventListener('DOMContentLoaded', function() {
    const noImageCheckbox = document.getElementById('noImage');
    const eventImageInput = document.getElementById('eventImage');

    noImageCheckbox.addEventListener('change', function() {
        if (noImageCheckbox.checked) {
            eventImageInput.value = '';
        }
    });

    eventImageInput.addEventListener('change', function() {
        if (eventImageInput.value) {
            noImageCheckbox.checked = false;
        }
    });
});

function validateForm() {
    const eventImage = document.getElementById('eventImage').value;
    const noImage = document.getElementById('noImage').checked;
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);
    const today = new Date();

    if (!eventImage && !noImage) {
        alert('Please either upload an image or select "No Image".');
        return false;
    }
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        alert('Please enter valid start and end dates.');
        return false;
    }
    
    if (startDate <= today) {
        alert('Start date must be after today.');
        return false;
    }
    
    if (endDate <= startDate) {
        alert('End date must be after the start date.');
        return false;
    }

    return true;
}

