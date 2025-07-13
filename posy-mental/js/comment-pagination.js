// Comment pagination variables
let currentCommentPage = 1;
let commentsPerPage = 5;
let totalCommentPages = 1;
let allComments = [];

// Format comment date
function formatCommentDate(dateString) {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

// Get random user icon
function getRandomUserIcon() {
    const randomNum = Math.floor(Math.random() * 7) + 1;
    return `user_icon/user_${randomNum}.jpg`;
}

// Format single comment HTML
function formatComment(comment) {
    return `
        <div class="single-comments">
            <div class="main">
                <div class="head">
                    <img src="${comment.userIcon || getRandomUserIcon()}" alt="#" />
                </div>
                <div class="body">
                    <h4>${comment.author}</h4>
                    <div class="comment-meta">
                        <span class="meta"><i class="fa fa-calendar"></i>${formatCommentDate(comment.createdAt)}</span>
                    </div>
                    <p>${comment.content}</p>
                </div>
            </div>
        </div>
    `;
}

// Update comment pagination controls
function updateCommentPaginationControls() {
    const prevButton = document.getElementById('prevCommentPage');
    const nextButton = document.getElementById('nextCommentPage');
    const pageNumbersContainer = document.getElementById('commentPageNumbers');

    prevButton.disabled = currentCommentPage === 1;
    nextButton.disabled = currentCommentPage === totalCommentPages;

    let pageNumbersHtml = '';
    for (let i = 1; i <= totalCommentPages; i++) {
        pageNumbersHtml += `
            <span class="page-number ${i === currentCommentPage ? 'active' : ''}" 
                  onclick="changeCommentPage(${i})">
                ${i}
            </span>
        `;
    }
    pageNumbersContainer.innerHTML = pageNumbersHtml;
}

// Change comment page
function changeCommentPage(pageNumber) {
    currentCommentPage = pageNumber;
    displayComments();
}

// Display comments with pagination
function displayComments() {
    const commentsContainer = document.getElementById('commentsContainer');

    if (allComments.length === 0) {
        commentsContainer.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
        document.querySelector('.comment-pagination-container').style.display = 'none';
        return;
    }

    // Calculate pagination
    totalCommentPages = Math.ceil(allComments.length / commentsPerPage);
    updateCommentPaginationControls();

    // Get current page comments
    const startIndex = (currentCommentPage - 1) * commentsPerPage;
    const endIndex = startIndex + commentsPerPage;
    const currentPageComments = allComments.slice(startIndex, endIndex);

    // Display comments
    commentsContainer.innerHTML = currentPageComments.map(formatComment).join('');

    // Show pagination if more than one page
    document.querySelector('.comment-pagination-container').style.display =
        totalCommentPages > 1 ? 'flex' : 'none';
}

// Load comments
async function loadComments(postId) {
    try {
        allComments = await getComments(postId);

        // Reset to first page
        currentCommentPage = 1;

        // Display comments with pagination
        displayComments();

        // Update comment count
        const count = await getCommentCount(postId);
        document.getElementById('commentCount').textContent = count;
    } catch (error) {
        console.error('Error loading comments:', error);
        document.getElementById('commentsContainer').innerHTML =
            '<p>Error loading comments. Please try again later.</p>';
        document.querySelector('.comment-pagination-container').style.display = 'none';
    }
}

// Handle comment form submission
async function handleCommentSubmit(e) {
    e.preventDefault();

    const postId = getUrlParam('id');
    const author = document.getElementById('commentAuthor').value;
    const content = document.getElementById('commentContent').value;

    try {
        const userIcon = getRandomUserIcon();
        await addComment(postId, author, content, userIcon);

        // Clear form
        document.getElementById('commentAuthor').value = '';
        document.getElementById('commentContent').value = '';

        // Reload comments to show the new comment
        await loadComments(postId);
    } catch (error) {
        console.error('Error adding comment:', error);
        alert('Error adding comment. Please try again.');
    }
}

// Initialize comment pagination
function initCommentPagination() {
    const postId = getUrlParam('id');
    if (postId) {
        loadComments(postId);

        // Set up comment pagination event listeners
        document.getElementById('prevCommentPage').addEventListener('click', () => {
            if (currentCommentPage > 1) {
                currentCommentPage--;
                displayComments();
            }
        });

        document.getElementById('nextCommentPage').addEventListener('click', () => {
            if (currentCommentPage < totalCommentPages) {
                currentCommentPage++;
                displayComments();
            }
        });

        // Set up comment form submission
        document.getElementById('commentForm').addEventListener('submit', handleCommentSubmit);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    await loadPost();
    initCommentPagination();
});