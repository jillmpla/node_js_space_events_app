function deleteEvent(eventId) {
    console.log('Delete button clicked for event ID:', eventId); 
    if (confirm('Are you sure you want to delete this event?')) {
        fetch(`/events/${eventId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            console.log('Fetch response:', response);
            if (response.ok) {
                console.log('Event deleted successfully'); 
                window.location.reload(); 
            } else {
                response.json().then(data => {
                    console.error('Error response from server:', data); 
                    alert(data.error || 'Failed to delete the event.');
                });
            }
        })
        .catch(error => {
            console.error('Fetch error:', error); 
            alert('An error occurred while deleting the event.');
        });
    }
}


