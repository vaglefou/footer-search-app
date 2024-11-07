const express = require('express')
const puppeteer = require('puppeteer')
const axios = require('axios')

const app = express()
app.use(express.json())

app.post('/api/search', async (req,res) => {
    const { query } = req.body

    const searchResults = await seachWeb(query)

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
        'https://example1.com',
        'https://example2.com'
    ];
}