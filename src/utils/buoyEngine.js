export async function fetchLiveBuoys() {
  try {
    const url = 'https://corsproxy.io/?https://www.ndbc.noaa.gov/data/latest_obs/latest_obs.txt';
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch NOAA buoy data');
    }
    
    const text = await response.text();
    const lines = text.split('\n');
    
    if (lines.length < 3) return [];

    // Parse header to dynamically find column indices
    const headerRow = lines[0].trim().split(/\s+/);
    const latIdx = headerRow.indexOf('LAT');
    const lonIdx = headerRow.indexOf('LON');
    const wtmpIdx = headerRow.indexOf('WTMP');
    const wvhtIdx = headerRow.indexOf('WVHT');
    const stnIdx = headerRow.indexOf('#STN') !== -1 ? headerRow.indexOf('#STN') : 0;

    if (latIdx === -1 || lonIdx === -1 || wtmpIdx === -1 || wvhtIdx === -1) {
      throw new Error('Failed to parse NOAA data columns');
    }

    const buoys = [];

    // Start from index 2 to skip headers
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(/\s+/);
      if (cols.length < Math.max(latIdx, lonIdx, wtmpIdx, wvhtIdx)) continue;

      const lat = parseFloat(cols[latIdx]);
      const lon = parseFloat(cols[lonIdx]);

      // Lake Michigan / Kenosha Region Filter
      if (lat >= 41.5 && lat <= 43.5 && lon >= -88.0 && lon <= -86.0) {
        const wtmpStr = cols[wtmpIdx];
        const wvhtStr = cols[wvhtIdx];

        // Skip buoys missing critical data
        if (wtmpStr !== 'MM' && wvhtStr !== 'MM') {
          const tempC = parseFloat(wtmpStr);
          const waveM = parseFloat(wvhtStr);

          // Convert to Fahrenheit and Feet
          const tempF = (tempC * 9/5) + 32;
          const waveHeightFt = waveM * 3.28084;

          buoys.push({
            id: cols[stnIdx],
            lat,
            lng: lon, // Mapped to lng for consistency if needed, though lon works too
            tempF: Number(tempF.toFixed(1)),
            waveHeightFt: Number(waveHeightFt.toFixed(1))
          });
        }
      }
    }

    return buoys;
  } catch (error) {
    console.error('Error fetching NOAA buoys:', error);
    return [];
  }
}
