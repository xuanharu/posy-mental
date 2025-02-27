const MENTAL_HEALTH_BASE_URL = 'http://localhost:8000/mental-health';

// Get all centers
async function getCenters() {
    try {
        const response = await fetch(`${MENTAL_HEALTH_BASE_URL}/centers`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching centers:', error);
        throw error;
    }
}

// Get a single center by ID
async function getCenter(centerId) {
    try {
        const response = await fetch(`${MENTAL_HEALTH_BASE_URL}/centers/${centerId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching center:', error);
        throw error;
    }
}

// Create a new center
async function createCenter(name, address, mapEmbed, contact, specialization, note) {
    try {
        const response = await fetch(`${MENTAL_HEALTH_BASE_URL}/centers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                address: address,
                map_embed: mapEmbed,
                contact: contact,
                specialization: specialization,
                note: note || ''
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating center:', error);
        throw error;
    }
}

// Update a center
async function updateCenter(centerId, name, address, mapEmbed, contact, specialization, note) {
    try {
        const response = await fetch(`${MENTAL_HEALTH_BASE_URL}/centers/${centerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                address: address,
                map_embed: mapEmbed,
                contact: contact,
                specialization: specialization,
                note: note || ''
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating center:', error);
        throw error;
    }
}

// Delete a center
async function deleteCenter(centerId) {
    try {
        const response = await fetch(`${MENTAL_HEALTH_BASE_URL}/centers/${centerId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error deleting center:', error);
        throw error;
    }
}