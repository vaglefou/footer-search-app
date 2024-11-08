require('dotenv').config();
const express = require('express')
const puppeteer = require('puppeteer')
const axios = require('axios')
const {Cluster} = require('puppeteer-cluster')

const app = express()
app.use(express.json())

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const CX_ID = process.env.CX_ID;


app.post('/api/search', async (req,res) => {
    const { query } = req.body

    const searchResults = await searchWeb(query)

    const footerData = []
    for (const url of searchResults) {
        const companyInfo = await getFooterCompanyInfo(url)
        footerData.push({url, company: companyInfo})
    }

    res.json(footerData)
})

async function searchWeb(query) {
    try {
        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
                key: GOOGLE_API_KEY,
                cx: CX_ID,
                q: query,
                num: 8,
            },
        });

        const searchResults = response.data.items || [];
        const urls = searchResults.map(item => item.link);
        return urls;
    } catch (error) {
        console.error('Σφάλμα στην αναζήτηση στο Google API:', error);
        return [];
    }
}

async function getFooterCompanyInfo(url) {
    // try {
    //     const browser = await puppeteer.launch({headless: true})
    //     const page = await browser.newPage()
    //     await page.setRequestInterception(true);
    //         page.on('request', (request) => {
    //             if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet' || request.resourceType() === 'font') {
    //                 request.abort();
    //             } else {
    //                 request.continue();
    //             }
    //         });
    //     await page.goto(url, { waitUntil: 'load', timeout: 0 });

    //         const footerText = await page.evaluate(() => {
    //             const footer = document.querySelector('footer')
    //             return footer ? footer.innerText : ''
    //         })

    //     //Phrases searching
    //     const keywords = ['Developed by', 'Powered by','Designed by','Made by','Website by','e-shop','eshop']
    //     for (const keyword of keywords) {
    //         const index = footerText.indexOf(keyword)
    //         if (index !== -1) {
    //             return footerText.substring(index + keyword.length).split('\n')[0].trim()
    //         }
    //     }
    //     return "Δεν βρέθηκε όνομα εταιρίας"
    // } catch (error) {
    //     console.error(`Σφάλμα στην ανάγνωση του footer για ${url}`, error)
    //     return null
    // }


    async function getFooterCompanyInfo(url) {
        const cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_CONTEXT,  // Χρησιμοποιεί ταυτόχρονα context, όχι νέες instantiations του browser
            maxConcurrency: 19, // Καθορίστε τον αριθμό των ταυτόχρονων εργασιών
        });
    
        const result = await cluster.execute(url, async ({ page, data: url }) => {
            await page.goto(url, { waitUntil: 'load', timeout: 0 });
    
            const footerText = await page.evaluate(() => {
                const footer = document.querySelector('footer');
                return footer ? footer.innerText : '';
            });
    
            const keywords = ['Developed by', 'Powered by', 'Designed by', 'Made by', 'Website by', 'e-shop', 'eshop'];
            for (const keyword of keywords) {
                const index = footerText.indexOf(keyword);
                if (index !== -1) {
                    return footerText.substring(index + keyword.length).split('\n')[0].trim();
                }
            }
            return "Δεν βρέθηκε όνομα εταιρίας";
        });
    
        await cluster.close();
    
        return result;
    }
    
}
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log (`Server is running on port ${PORT}`))