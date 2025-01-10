const BASE_URL = 'http://localhost:8000/post';

// Get all posts
async function getPosts() {
    try {
        const response = await fetch(`${BASE_URL}/posts`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching posts:', error);
        throw error;
    }
}

// Get a single post by ID
async function getPost(postId) {
    try {
        const response = await fetch(`${BASE_URL}/post/${postId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching post:', error);
        throw error;
    }
}

// Create a new post
async function createPost(title, content, imageUrl, author) {
    try {
        const params = new URLSearchParams({
            title: title,
            content: content,
            image_url: imageUrl,
            author: author
        });

        const response = await fetch(`${BASE_URL}/create-post?${params.toString()}`, {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error creating post:', error);
        throw error;
    }
}

// Update a post
async function updatePost(postId, title, content, imageUrl, author) {
    try {
        const params = new URLSearchParams({
            title: title,
            content: content,
            image_url: imageUrl,
            author: author
        });

        const response = await fetch(`${BASE_URL}/update-post/${postId}?${params.toString()}`, {
            method: 'PUT',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error updating post:', error);
        throw error;
    }
}

// Delete a post
async function deletePost(postId) {
    try {
        const response = await fetch(`${BASE_URL}/delete-post/${postId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error deleting post:', error);
        throw error;
    }
}
