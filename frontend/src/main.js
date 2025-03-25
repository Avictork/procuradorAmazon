document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('search-form');
  const keywordInput = document.getElementById('keyword');
  const resultsContainer = document.getElementById('results');
  const loadingIndicator = document.getElementById('loading');

  searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const keyword = keywordInput.value.trim();

    if (!keyword) {
      alert('Please enter a search keyword');
      return;
    }

    try {
      loadingIndicator.style.display = 'block';
      resultsContainer.innerHTML = '';

      const response = await fetch(`http://localhost:3000/api/scrape?keyword=${encodeURIComponent(keyword)}`);

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const products = await response.json();

      if (products.length === 0) {
        resultsContainer.innerHTML = '<p>No products found. Try a different keyword.</p>';
        return;
      }

      products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';

        productCard.innerHTML = `
          <img src="${product.imageUrl}" alt="${product.title}" class="product-image">
          <div class="product-info">
            <h3>${product.title}</h3>
            <div class="product-rating">
              <span class="stars">${'★'.repeat(Math.round(parseFloat(product.rating || 0))}${'☆'.repeat(5 - Math.round(parseFloat(product.rating || 0))}</span>
              <span>${product.rating} (${product.reviews} reviews)</span>
            </div>
          </div>
        `;

        resultsContainer.appendChild(productCard);
      });
    } catch (error) {
      console.error('Error:', error);
      resultsContainer.innerHTML = '<p class="error">Failed to load products. Please try again later.</p>';
    } finally {
      loadingIndicator.style.display = 'none';
    }
      });
      });