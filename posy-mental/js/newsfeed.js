$(document).ready(function() {
            // Initialize mobile navigation and scroll to top
            $('.mobile-nav').slicknav({
                prependTo: '.mobile-nav',
                duration: 300,
                closeOnClick: true
            });

            $.scrollUp({
                scrollName: 'scrollUp',
                scrollDistance: 300,
                scrollFrom: 'top',
                scrollSpeed: 300,
                easingType: 'linear',
                animation: 'fade',
                animationSpeed: 200,
                scrollTrigger: false,
                scrollText: ["<i class='fa fa-angle-up'></i>"],
                scrollTitle: false,
                scrollImg: false,
                activeOverlay: false,
                zIndex: 2147483647
            });

            // Pagination variables
            let currentPage = 1;
            let postsPerPage = 5;
            let totalPages = 1;
            let allPosts = [];
            let currentSearchResults = null;
            let activeTag = null;
            let allTags = new Set();

            // Load and display posts
            loadPosts();

            // Pagination event listeners
            document.getElementById('prevPage').addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    displayPosts(currentSearchResults || allPosts);
                }
            });

            document.getElementById('nextPage').addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    displayPosts(currentSearchResults || allPosts);
                }
            });

            // Setup search functionality
            const searchInput = document.getElementById('searchInput');
            const searchResults = document.getElementById('searchResults');
            const clearSearchBtn = document.getElementById('clearSearch');
            let searchTimeout;

            // Search input events
            searchInput.addEventListener('input', function() {
                const query = this.value.trim();
                clearSearchBtn.disabled = !query;

                clearTimeout(searchTimeout);

                if (query.length > 0) {
                    searchResults.innerHTML = '<div class="search-result-item">Searching...</div>';
                    searchResults.classList.add('active');

                    searchTimeout = setTimeout(async() => {
                        try {
                            const results = await searchPosts(query);
                            if (results && results.length > 0) {
                                displaySearchResults(results);
                                currentSearchResults = results;
                                displayPosts(results);
                            } else {
                                searchResults.innerHTML = '<div class="search-result-item">No matching posts found</div>';
                                displayError(
                                    "No matching posts found",
                                    "Try different search terms or browse all posts"
                                );
                            }
                        } catch (error) {
                            console.error('Search error:', error);
                            searchResults.innerHTML = '<div class="search-result-item">Error searching posts</div>';
                            displayError('Search Error', 'Failed to search posts. Please try again.');
                        }
                    }, 300);
                } else {
                    searchResults.classList.remove('active');
                    currentSearchResults = null;
                    displayPosts(allPosts);
                }
            });

            // Enter key for immediate search
            searchInput.addEventListener('keydown', async function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    clearTimeout(searchTimeout);
                    const query = this.value.trim();

                    if (query) {
                        try {
                            const results = await searchPosts(query);
                            currentSearchResults = results;
                            displayPosts(results);

                            if (results && results.length > 0) {
                                displaySearchResults(results);
                            } else {
                                searchResults.innerHTML = '<div class="search-result-item">No matching posts found</div>';
                            }
                        } catch (error) {
                            console.error('Search error:', error);
                            displayError('Search Error', 'Failed to search posts. Please try again.');
                        }
                        searchResults.classList.remove('active');
                    } else {
                        currentSearchResults = null;
                        displayPosts(allPosts);
                    }
                }
            });

            // Clear search button
            clearSearchBtn.addEventListener('click', function() {
                searchInput.value = '';
                clearSearchBtn.disabled = true;
                searchResults.classList.remove('active');
                currentSearchResults = null;
                displayPosts(allPosts);
            });

            // Close search results when clicking outside
            document.addEventListener('click', function(e) {
                if (!searchResults.contains(e.target) && e.target !== searchInput) {
                    searchResults.classList.remove('active');
                }
            });

            async function loadPosts() {
                try {
                    // Fetch all posts, filter out those with 'pending' or 'approval' tag
                    const posts = await getPosts();
                    let filteredPosts = posts
                        .filter(post => {
                            const tags = post.tags || [];
                            return !tags.includes('pending') && !tags.includes('approval') && !post.source;
                        })
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                    // Find posts with author as ObjectId (24 hex chars)
                    const idRegex = /^[a-f\d]{24}$/i;
                    const idToIndex = {};
                    const idsToFetch = [];
                    filteredPosts.forEach((post, idx) => {
                        if (typeof post.author === "string" && idRegex.test(post.author)) {
                            idToIndex[post.author] = idx;
                            idsToFetch.push(post.author);
                        }
                    });

                    // Fetch all author names in parallel
                    if (idsToFetch.length > 0) {
                        const uniqueIds = [...new Set(idsToFetch)];
                        const nameResults = await Promise.all(
                            uniqueIds.map(id =>
                                getUserById(id)
                                    .then(user => ({ id, name: user.name }))
                                    .catch(() => ({ id, name: "Unknown" }))
                            )
                        );
                        // Map id to name
                        const idToName = {};
                        nameResults.forEach(({ id, name }) => {
                            idToName[id] = name;
                        });
                        // Replace author field in posts
                        filteredPosts.forEach(post => {
                            if (typeof post.author === "string" && idToName[post.author]) {
                                post.author = idToName[post.author];
                            }
                        });
                    }

                    allPosts = filteredPosts;

                    if (allPosts && allPosts.length > 0) {
                        // Collect all unique tags
                        allPosts.forEach(post => {
                            if (post.tags && Array.isArray(post.tags)) {
                                post.tags.forEach(tag => allTags.add(tag));
                            }
                        });
                        updateTagList();
                        displayPosts(allPosts);
                        updateRecentPosts(allPosts);
                    } else {
                        displayError("No posts available", "Create some posts to see them here");
                    }
                } catch (error) {
                    console.error('Error loading posts:', error);
                    if (error.message.includes('Failed to fetch')) {
                        displayError(
                            "Cannot connect to server",
                            "Please make sure the backend server is running at http://localhost:8000"
                        );
                    } else {
                        displayError("Error loading posts", "Please try again later");
                    }
                }
            }

            function updateTagList() {
                const tagList = document.getElementById('tagList');
                tagList.innerHTML = Array.from(allTags).map(tag =>
                    `<li class="tag-item ${tag === activeTag ? 'active' : ''}" 
             onclick="filterByTag('${tag}')">${tag}</li>`
                ).join('');
            }

            window.filterByTag = async function(tag) {
                if (activeTag === tag) {
                    // Deactivate the current tag filter
                    activeTag = null;
                    currentSearchResults = null;
                    displayPosts(allPosts);
                } else {
                    try {
                        activeTag = tag;
                        const filteredPosts = await filterPostsByTag(tag);
                        currentSearchResults = filteredPosts;
                        displayPosts(filteredPosts);
                    } catch (error) {
                        console.error('Error filtering by tag:', error);
                        displayError('Filter Error', 'Failed to filter posts by tag. Please try again.');
                    }
                }
                updateTagList();
            };

            function displayError(title, message) {
                document.getElementById('postsContainer').innerHTML = `
            <div class="error-message">
                <h3>${title}</h3>
                <p>${message}</p>
            </div>
        `;
                document.getElementById('recentPosts').innerHTML = `
            <li>No recent posts available</li>
        `;
            }

            function displayPosts(posts) {
                const postsContainer = document.getElementById('postsContainer');
                const isSearchResult = currentSearchResults !== null;

                if (!posts || posts.length === 0) {
                    displayError(
                        isSearchResult ? "No matching posts found" : "No posts available",
                        isSearchResult ? "Try a different search term" : "Check back later for new content"
                    );
                    return;
                }

                if (!isSearchResult) {
                    updateRecentPosts(posts);
                }

                totalPages = Math.ceil(posts.length / postsPerPage);
                updatePaginationControls();

                const startIndex = (currentPage - 1) * postsPerPage;
                const endIndex = startIndex + postsPerPage;
                const currentPosts = posts.slice(startIndex, endIndex);

                const featuredPost = currentPosts[0];
                let html = `
            <div class="article-card featured-post" data-post-id="${featuredPost._id}" 
                 onclick="window.location.href='blog-single.html?id=${featuredPost._id}'">
                <img src="${featuredPost.imageUrl || 'images/news_feature.png'}" 
                     alt="${featuredPost.title}" class="article-image">
                <div class="article-content">
                    <h2 class="article-title">${featuredPost.title}</h2>
                    <div class="article-meta">
                        <span><i class="fa fa-user"></i> ${featuredPost.author}</span>
                        <span><i class="fa fa-calendar"></i> ${new Date(featuredPost.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div class="article-text">
                        ${featuredPost.content.replace(/[*_#`]/g, '').replace(/\n/g, '<br>')}
                    </div>
                    ${featuredPost.tags && featuredPost.tags.length > 0 ? 
                        `<div class="post-tags">
                            ${featuredPost.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
                        </div>` : ''}
                </div>
            </div>
        `;

        if (currentPosts.length > 1) {
            html += '<div class="posts-grid">';
            currentPosts.slice(1).forEach(post => {
                html += `
                    <div class="article-card" data-post-id="${post._id}" 
                         onclick="window.location.href='blog-single.html?id=${post._id}'">
                        <img src="${post.imageUrl || 'images/news_feature.png'}" 
                             alt="${post.title}" class="article-image">
                        <div class="article-content">
                            <h2 class="article-title">${post.title}</h2>
                            <div class="article-meta">
                                <span><i class="fa fa-user"></i> ${post.author}</span>
                                <span><i class="fa fa-calendar"></i> ${new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div class="article-text">
                                ${post.content.replace(/[*_#`]/g, '').replace(/\n/g, '<br>')}
                            </div>
                            ${post.tags && post.tags.length > 0 ? 
                                `<div class="post-tags">
                                    ${post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
                                </div>` : ''}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
        }

        postsContainer.innerHTML = html;
    }

    function updatePaginationControls() {
        const prevButton = document.getElementById('prevPage');
        const nextButton = document.getElementById('nextPage');
        const pageNumbersContainer = document.getElementById('pageNumbers');

        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;

        let pageNumbersHtml = '';
        for (let i = 1; i <= totalPages; i++) {
            pageNumbersHtml += `
                <span class="page-number ${i === currentPage ? 'active' : ''}" 
                      onclick="changePage(${i})">
                    ${i}
                </span>
            `;
        }
        pageNumbersContainer.innerHTML = pageNumbersHtml;
    }

    window.changePage = function(pageNumber) {
        currentPage = pageNumber;
        displayPosts(currentSearchResults || allPosts);
    }

    function displaySearchResults(posts) {
        if (!Array.isArray(posts) || posts.length === 0) {
            searchResults.innerHTML = '<div class="search-result-item">No matching posts found</div>';
            return;
        }

        searchResults.innerHTML = posts.slice(0, 5).map(post => `
            <div class="search-result-item" onclick="scrollToPost('${post._id}')">
                <div class="search-result-title">${post.title}</div>
                <div class="search-result-meta">
                    By ${post.author} | ${new Date(post.createdAt).toLocaleDateString()}
                </div>
            </div>
        `).join('');
    }

    function updateRecentPosts(posts) {
        const recentPostsList = document.getElementById('recentPosts');
        const recentPosts = posts.slice(0, 5);

        recentPostsList.innerHTML = recentPosts.map(post => `
            <li onclick="scrollToPost('${post._id}')" style="cursor: pointer" data-post-id="${post._id}">
                ${post.title}
                <span class="post-date">${new Date(post.createdAt).toLocaleDateString()}</span>
            </li>
        `).join('');
    }

    window.scrollToPost = function(postId) {
        const postElement = document.querySelector(`[data-post-id="${postId}"]`);
        if (postElement) {
            postElement.scrollIntoView({
                behavior: 'smooth'
            });
            document.getElementById('searchResults').classList.remove('active');
        }
    }
});
