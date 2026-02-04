/**
 * Backend proxy for Melissa Data API
 * Solves CORS issues when calling from browser
 * Converts count response from XML to JSON
 * 
 * Uses /get/circle endpoint with latitude/longitude for count-based searches
 */

import express from 'express'
import fetch from 'node-fetch'
import cors from 'cors'
import { parseStringPromise } from 'xml2js'

const app = express()

// Enable CORS
app.use(cors())
app.use(express.json())

// Melissa Data API Configuration
const MELISSA_API_CIRCLE = 'http://list.melissadata.net/v1/Consumer/rest/Service.svc/get/circle'
const MELISSA_API_KEY = '108641783'

/**
 * Parse XML response from Melissa /get/circle API
 * Extracts TotalCount > Count value
 */
async function parseCircleResponse(xmlString) {
  try {
    const result = await parseStringPromise(xmlString, {
      explicitArray: false,
      mergeAttrs: true
    })

    console.log('Parsed XML structure keys:', Object.keys(result))

    let count = 0

    if (result.Consumer && result.Consumer.TotalCount) {
      const totalCountValue = result.Consumer.TotalCount.Count
      count = parseInt(totalCountValue) || 0
      console.log(`Total count extracted: ${count}`)
    } else {
      console.log('TotalCount not found in response')
    }

    return { count }
  } catch (err) {
    console.error('XML Parse Error:', err.message)
    throw new Error(`Failed to parse API response: ${err.message}`)
  }
}

/**
 * POST /api/houses
 * Request body:
 * {
 *   lat: latitude (number),
 *   lng: longitude (number),
 *   mile: radius in miles (1-50)
 * }
 */
app.post('/api/houses', async (req, res) => {
  try {
    const { lat, lng, mile } = req.body

    // Validate inputs
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'Latitude and longitude are required' })
    }

    const latitude = parseFloat(lat)
    const longitude = parseFloat(lng)

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ error: 'Invalid latitude or longitude' })
    }

    if (isNaN(mile) || mile < 1 || mile > 50) {
      return res.status(400).json({ error: 'Radius must be between 1 and 50 miles' })
    }

    // Build API URL for circle search
    const url = new URL(MELISSA_API_CIRCLE)
    url.searchParams.append('id', MELISSA_API_KEY)
    // Important: pt format is longitude;latitude (not lat;lng)
    url.searchParams.append('pt', `${longitude};${latitude}`)
    url.searchParams.append('mile', mile.toString())

    console.log(`\n--- New Circle Search ---`)
    console.log(`Coordinates: ${latitude}, ${longitude}`)
    console.log(`Radius: ${mile} miles`)
    console.log(`Fetching from: ${url.toString()}`)

    // Call Melissa API
    const response = await fetch(url.toString())

    if (!response.ok) {
      console.error(`Melissa API error: ${response.status} ${response.statusText}`)
      return res.status(response.status).json({
        error: `Melissa API error: ${response.status} ${response.statusText}`
      })
    }

    const contentType = response.headers.get('content-type')
    let data

    // Parse response based on content type
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else if (
      contentType &&
      (contentType.includes('application/xml') || contentType.includes('text/xml') || contentType.includes('text/plain'))
    ) {
      const xmlText = await response.text()
      console.log('Raw XML response:', xmlText.substring(0, 500))
      data = await parseCircleResponse(xmlText)
    } else {
      return res.status(400).json({
        error: `Unexpected content type: ${contentType}`
      })
    }

    return res.json({
      count: data.count,
      latitude,
      longitude,
      radius: mile
    })
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({
      error: `Server error: ${error.message}`
    })
  }
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Start server
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Melissa API proxy running on http://localhost:${PORT}`)
  console.log(`POST http://localhost:${PORT}/api/houses with: { lat, lng, mile }`)
})
