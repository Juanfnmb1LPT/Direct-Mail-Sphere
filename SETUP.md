# House Map Search Component

A Vue 3 component that displays an interactive map with house locations fetched from the Melissa Data API.

## Features

✅ **Interactive Map** - Uses Leaflet for map visualization (no API key required)  
✅ **ZIP Code Search** - Enter a ZIP code to find houses  
✅ **Customizable Results** - Specify the number of houses to fetch (1-100)  
✅ **Real-time Markers** - Displays house locations as markers on the map  
✅ **Dynamic Updates** - Map and results update when search parameters change  
✅ **Loading State** - Shows loading indicator while fetching data  
✅ **Error Handling** - Displays user-friendly error messages  
✅ **Results List** - Shows detailed information about each house  
✅ **Responsive Design** - Works on desktop and mobile devices  

## Component Structure

```
HouseMapComponent.vue     - Main Vue 3 component
├── Search Form          - ZIP code and number of houses inputs
├── Leaflet Map          - Interactive map display
├── House Markers        - Clickable markers with popup info
└── Results List         - Sidebar showing all houses found
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup Steps

1. **Install dependencies:**
```bash
npm install
```

2. **Start both backend and frontend together:**
```bash
npm run dev:full
```

Or run them separately in different terminals:

**Terminal 1 - Backend proxy:**
```bash
npm run server
```

**Terminal 2 - Frontend dev server:**
```bash
npm run dev
```

3. **Build for production:**
```bash
npm run build
```

The development servers will be running at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001/api/houses`

## Usage

### Basic Implementation

The component is already set up in `App.vue`. Simply use it:

```vue
<template>
  <HouseMapComponent />
</template>

<script setup>
import HouseMapComponent from './HouseMapComponent.vue'
</script>
```

### How It Works

1. **Enter Search Parameters**
   - ZIP Code (required)
   - Number of Houses (1-100, default: 10)

2. **Click Search**
   - Component fetches data from Melissa Data API
   - Loading indicator appears while fetching
   - Map displays markers for each house found

3. **View Results**
   - Markers appear on the map at house locations
   - Click markers to see address details
   - Results list on the right shows all houses
   - Map automatically fits to bounds of all markers

## API Integration

### Backend Proxy Solution

The component uses a **Node.js/Express backend proxy** to call the Melissa Data API. This solves CORS (Cross-Origin Resource Sharing) issues that prevent direct browser-to-API calls.

**Why a proxy?**
- Melissa API doesn't allow direct browser requests (CORS policy)
- Backend proxy handles the request securely from server-to-server
- No API key exposure in client-side code

### How It Works

1. **Frontend** → sends request to `/api/houses?zip=10001&records=10`
2. **Vite Dev Server** → proxies request to `http://localhost:3001`
3. **Backend Proxy** → calls actual Melissa API with API key
4. **Response** → returns JSON data to frontend

### Melissa Data API

**Endpoint (via proxy):**
```
http://localhost:3001/api/houses?zip={ZIP}&records={NUMBER}
```

**Original Melissa API:**
```
http://list.melissadata.net/v1/Consumer/rest/Service.svc/get/zip?id=108641783&zip={ZIP}&records={NUMBER}
```

**Parameters:**
- `zip`: ZIP code to search
- `records`: Number of records to return (1-100)

**Response Example:**
```json
{
  "Records": [
    {
      "DeliveryAddress": "123 Main St",
      "City": "New York",
      "State": "NY",
      "Zip": "10001",
      "Latitude": 40.7128,
      "Longitude": -74.0060,
      "Phone": "5551234567",
      "Email": "resident@example.com"
    }
  ]
}
```

### Data Handling

Currently, the component extracts and displays:
- Address
- City, State, ZIP
- Latitude/Longitude (for map markers)

Phone and email are fetched but not displayed (can be enabled by modifying the component).

## Component Props & Features

### Reactive State
- `formData.zipCode` - User-entered ZIP code
- `formData.numHouses` - Number of houses to fetch
- `housesData` - Array of fetched house records
- `isLoading` - Loading state indicator
- `error` - Error message display

### Methods
- `fetchHouses()` - Fetches data from Melissa API
- `handleSearch()` - Form submission handler
- `updateMap()` - Updates map markers based on house data

### Map Features
- Leaflet map centered on USA
- OpenStreetMap tile layer
- Automatic bounds fitting
- Clickable markers with popups
- Feature group for easy marker management

## Customization

### Change Map Provider

To use Google Maps instead of Leaflet, you would need:
1. A Google Maps API key
2. Modification to use the Google Maps JavaScript SDK
3. Different marker and info window handling

Current implementation uses free, open-source Leaflet + OpenStreetMap.

### Modify Tile Layer

Change the tile provider in `HouseMapComponent.vue`:

```javascript
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
})
```

Other options:
- **Stamen**: `https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png`
- **CartoDB**: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`

### Enable Auto-Search

Uncomment the watch block to automatically search when ZIP code or number changes:

```javascript
// In watch section:
handleSearch()  // Auto-search on parameter change
```

### Display Phone/Email

To show phone and email in the popup, modify the popup binding:

```javascript
const marker = L.marker([house.latitude, house.longitude])
  .bindPopup(
    `<strong>${house.address}</strong><br/>
     ${house.city}, ${house.state} ${house.zip}<br/>
     <small>Phone: ${house.phone}</small><br/>
     <small>Email: ${house.email}</small>`
  )
```

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Notes

- Leaflet is lightweight (~40KB minified)
- Markers are efficiently managed using FeatureGroup
- Map bounds calculation is automatic
- No external dependencies beyond Vue 3 and Leaflet

## Troubleshooting

### "Failed to fetch data: make sure backend proxy is running"
- The Vite dev server can't reach the backend API
- **Solution:** Run `npm run server` in a separate terminal
- Or use `npm run dev:full` to start both servers

### Backend won't start (port 3001 in use)
- Another process is using port 3001
- **Solution:** Kill the process or use a different port:
  ```javascript
  // In server.js, change the PORT variable:
  const PORT = 3002  // Use a different port
  ```

### "No houses found" for valid ZIP codes
- The ZIP code might not exist in the Melissa database
- Try common ZIP codes: `10001` (NY), `90210` (CA), `60601` (IL)
- Check the API response in browser console

### Map not displaying
- Leaflet CSS might not be loading
- Check browser console for errors
- Verify `leaflet.css` import is present in component

### CORS errors in console
- This is expected if not using the backend proxy
- Solution: Make sure backend proxy is running and accessible

### API key error
- The API key in `server.js` might be invalid
- **Update the key:** Find `MELISSA_API_KEY` in `server.js`
- Contact Melissa Data support for a valid key

## Dependencies

- **vue** (^3.3.4) - Frontend framework
- **leaflet** (^1.9.4) - Map library
- **vite** - Build tool (dev dependency)
- **@vitejs/plugin-vue** - Vue support for Vite

## File Structure

```
Direct-Mail-Sphere/
├── HouseMapComponent.vue    - Main map component
├── App.vue                  - Root application component
├── main.js                  - Vue app entry point
├── index.html               - HTML template
├── server.js                - Backend proxy server
├── vite.config.js           - Vite configuration (includes API proxy)
├── package.json             - Dependencies and scripts
├── SETUP.md                 - This file
└── README.md                - Project overview
```

## Backend Proxy Details

**File:** `server.js`

The backend proxy:
- Runs on `http://localhost:3001`
- Forwards requests to the Melissa API
- Handles CORS headers
- Validates input (ZIP code, number of records)
- Returns JSON responses

**Key Features:**
- ✅ Secure API key handling (kept on server)
- ✅ Input validation
- ✅ Error handling
- ✅ Health check endpoint (`/api/health`)

## License

This project is provided as-is for use with Direct Mail Sphere.

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify API credentials and endpoint access
3. Test with different ZIP codes
4. Review component console logs for debugging

---

**Last Updated:** February 2026
