require('dotenv').config();
const express = require('express')
const puppeteer = require('puppeteer')
const axios = require('axios')

const app = express()
app.use(express.json())


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
    //Temporary mock URLs for testing
    return [
        'https://www.cptpapadakisphoto.gr/',
        'https://kris-karras.gr/'
    ];
}

async function getFooterCompanyInfo(url) {
    try {
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto(url, {waitUntil: 'load', timeout: 0})

        const footerText = await page.evaluate(() => {
            const footer = document.querySelector('footer')
            return footer ? footer.innerText : ''
        })

        //Phrases searching
        const keywords = ['Developed by', 'Powered by','Designed by','Made by','Website by','e-shop','eshop']
        for (const keyword of keywords) {
            const index = footerText.indexOf(keyword)
            if (index !== -1) {
                return footerText.substring(index + keyword.length).split('\n')[0].trim()
            }
        }
        return "Δεν βρέθηκε όνομα εταιρίας"
    } catch (error) {
        console.error(`Σφάλμα στην ανάγνωση του footer για ${url}`, error)
        return null
    }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log (`Server is running on port ${PORT}`))