 const BASE_URL = 'http://localhost:8000/post';

 // Search posts
 async function searchPosts(searchTerm) {
     try {
         const response = await fetch(`${BASE_URL}/search?term=${encodeURIComponent(searchTerm.trim())}`);
         if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}`);
         }
         return await response.json();
     } catch (error) {
         console.error('Error searching posts:', error);
         throw error;
     }
 }

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
 async function createPost(title, content, imageUrl, author, tags, source) {
     try {
         const params = new URLSearchParams({
             title: title,
             content: content,
             image_url: imageUrl,
             author: author,
             tags: JSON.stringify(tags || [])
         });

         if (source) {
             params.append('source', source);
         }

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
 async function updatePost(postId, title, content, imageUrl, author, tags) {
     try {
         const params = new URLSearchParams({
             title: title,
             content: content,
             image_url: imageUrl,
             author: author,
             tags: JSON.stringify(tags || [])
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

 // Filter posts by tag
 async function filterPostsByTag(tag) {
     try {
         const response = await fetch(`${BASE_URL}/posts/tag/${encodeURIComponent(tag)}`);
         if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}`);
         }
         return await response.json();
     } catch (error) {
         console.error('Error filtering posts by tag:', error);
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

 // Add a comment to a post
 async function addComment(postId, author, content) {
     try {
         const params = new URLSearchParams({
             author: author,
             content: content
         });

         const response = await fetch(`${BASE_URL}/post/${postId}/comment?${params.toString()}`, {
             method: 'POST',
         });

         if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}`);
         }
         return await response.json();
     } catch (error) {
         console.error('Error adding comment:', error);
         throw error;
     }
 }

 // Get all comments for a post
 async function getComments(postId) {
     try {
         const response = await fetch(`${BASE_URL}/post/${postId}/comments`);
         if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}`);
         }
         return await response.json();
     } catch (error) {
         console.error('Error fetching comments:', error);
         throw error;
     }
 }

 // Get comment count for a post
 async function getCommentCount(postId) {
     try {
         const response = await fetch(`${BASE_URL}/post/${postId}/comment-count`);
         if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}`);
         }
         return await response.json();
     } catch (error) {
         console.error('Error fetching comment count:', error);
         throw error;
     }
 }

 // Delete a comment
 async function deleteComment(commentId) {
     try {
         const response = await fetch(`${BASE_URL}/comment/${commentId}`, {
             method: 'DELETE',
         });

         if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}`);
         }
         return await response.json();
     } catch (error) {
         console.error('Error deleting comment:', error);
         throw error;
     }
 }

 // Get all crawled posts
 async function getCrawledPosts() {
     try {
         const response = await fetch(`${BASE_URL}/crawled-posts`);
         if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}`);
         }
         return await response.json();
     } catch (error) {
         console.error('Error fetching crawled posts:', error);
         throw error;
     }
 }