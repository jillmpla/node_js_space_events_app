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

    document.getElementById('editEventForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const formData = new FormData(this);
        const eventId = this.getAttribute('data-event-id');
        
        try {
            const response = await fetch(`/events/${eventId}`, {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                window.location.href = '/events'; 
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to update the event.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while updating the event.');
        }
    });
});

