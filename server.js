import express from 'express';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import cors from 'cors';

const app = express();
const PORT = 3000;


app.use(cors());
app.use(express.json());

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};


async function scrapeAmazon(keyword) {
  try {
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;
    const response = await axios.get(url, { headers: HEADERS });
    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    const products = [];
    const items = document.querySelectorAll('.s-result-item');

    items.forEach((item) => {
      try {
        const titleElement = item.querySelector('h2 a span');
        const title = titleElement ? titleElement.textContent.trim() : null;

        const ratingElement = item.querySelector('.a-icon-star-small .a-icon-alt');
        const rating = ratingElement ? ratingElement.textContent.split(' ')[0] : null;

        const reviewsElement = item.querySelector('.a-size-small .a-link-normal .a-size-base');
        const reviews = reviewsElement ? reviewsElement.textContent.replace(/,/g, '') : null;

        const imageElement = item.querySelector('.s-image');
        const imageUrl = imageElement ? imageElement.src : null;

        if (title && imageUrl) {
          products.push({
            title,
            rating: rating || 'No rating',
            reviews: reviews || '0',
            imageUrl
          });
        }
      } catch (error) {
        console.error('Error parsing product:', error);
      }
    });

    return products;
  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error('Failed to scrape Amazon');
  }
}


app.get('/api/scrape', async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword parameter is required' });
    }

    const products = await scrapeAmazon(keyword);
    res.json(products);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});