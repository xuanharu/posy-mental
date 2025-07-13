// Setup previous and next post navigation
function setupPostNavigation(allPosts, currentPostId) {
    if (!allPosts || allPosts.length === 0) return;

    // Sort posts by date (newest first)
    const sortedPosts = [...allPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Find the index of the current post
    const currentIndex = sortedPosts.findIndex(post => post._id === currentPostId);

    if (currentIndex === -1) return;

    const prevPostLink = document.getElementById('prevPostLink');
    const nextPostLink = document.getElementById('nextPostLink');

    // Setup previous post link (newer post)
    if (currentIndex > 0) {
        const prevPost = sortedPosts[currentIndex - 1];
        prevPostLink.href = `blog-single.html?id=${prevPost._id}`;
        prevPostLink.title = `Previous: ${prevPost.title}`;
        prevPostLink.parentElement.classList.remove('disabled');
    } else {
        prevPostLink.href = '#';
        prevPostLink.title = 'No newer posts';
        prevPostLink.parentElement.classList.add('disabled');
        prevPostLink.style.opacity = '0.5';
        prevPostLink.style.cursor = 'not-allowed';
    }

    // Setup next post link (older post)
    if (currentIndex < sortedPosts.length - 1) {
        const nextPost = sortedPosts[currentIndex + 1];
        nextPostLink.href = `blog-single.html?id=${nextPost._id}`;
        nextPostLink.title = `Next: ${nextPost.title}`;
        nextPostLink.parentElement.classList.remove('disabled');
    } else {
        nextPostLink.href = '#';
        nextPostLink.title = 'No older posts';
        nextPostLink.parentElement.classList.add('disabled');
        nextPostLink.style.opacity = '0.5';
        nextPostLink.style.cursor = 'not-allowed';
    }
}

// Add this to the window object so it can be called from other scripts
window.setupPostNavigation = setupPostNavigation;