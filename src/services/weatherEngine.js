export async function fetchLakeWeather(lat, lon) {
  try {
    const apiKey = import.meta.env.VITE_OPENWEATHER_KEY;
    if (!apiKey) throw new Error("Missing VITE_OPENWEATHER_KEY");
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`);
    if (!res.ok) throw new Error("Failed to fetch weather data");
    return await res.json();
  } catch (err) {
    console.error("fetchLakeWeather error:", err);
    return {
      error: true,
      temp: "--",
      windSpeed: 0,
      pressure: 29.92,
      windDegree: 0,
      clouds: 0,
      main: {
        temp: 0,
        pressure: 1013.25,
        humidity: 50
      },
      wind: {
        speed: 0,
        deg: 0
      },
      clouds: {
        all: 0
      },
      sys: {
        sunrise: Math.floor(Date.now() / 1000) - 10000,
        sunset: Math.floor(Date.now() / 1000) + 10000
      },
      dt: Math.floor(Date.now() / 1000),
      name: "Offline Mode"
    };
  }
}

export function calculateBiteScore(weatherData) {
  let score = 0;

  // Pressure
  const pressureHpa = weatherData.main.pressure;
  const pressureInHg = pressureHpa / 33.8639;
  if (pressureInHg < 29.8) {
    score += 35;
  } else if (pressureInHg >= 29.8 && pressureInHg <= 30.2) {
    score += 20;
  } else if (pressureInHg > 30.2) {
    score += 0;
  }

  // Time of Day
  const dt = weatherData.dt;
  const sunrise = weatherData.sys.sunrise;
  const sunset = weatherData.sys.sunset;
  
  const isNearSunrise = Math.abs(dt - sunrise) <= 3600;
  const isNearSunset = Math.abs(dt - sunset) <= 3600;
  const isNight = dt < (sunrise - 3600) || dt > (sunset + 3600);
  
  if (isNearSunrise || isNearSunset) {
    score += 25;
  } else if (isNight) {
    score += 15;
  } else {
    score += 5; // Midday
  }

  // Cloud Cover
  const clouds = weatherData.clouds.all;
  if (clouds >= 70) {
    score += 20;
  } else if (clouds >= 30) {
    score += 10;
  } else {
    score += 0;
  }

  // Wind Speed
  const wind = weatherData.wind.speed;
  if (wind >= 20) {
    score -= 20;
  } else if (wind >= 13) {
    score += 10;
  } else if (wind >= 5) {
    score += 20;
  } else {
    score += 5;
  }

  // Cap score
  score = Math.max(0, Math.min(100, score));

  let status = {};
  if (score >= 80) {
    status = { text: "EPIC BITE", color: "text-green-500" };
  } else if (score >= 50) {
    status = { text: "FAIR CONDITIONS", color: "text-yellow-500" };
  } else {
    status = { text: "TOUGH FISHING", color: "text-red-500" };
  }

  return { score, status };
}

export function determineTargetSpecies(weatherData, biteScore) {
  const temp = weatherData.main.temp;
  const wind = weatherData.wind.speed;
  const clouds = weatherData.clouds.all;
  const dt = weatherData.dt;
  const sunrise = weatherData.sys.sunrise;
  const sunset = weatherData.sys.sunset;

  const isNearSunrise = Math.abs(dt - sunrise) <= 3600;
  const isNearSunset = Math.abs(dt - sunset) <= 3600;
  const isNight = dt < (sunrise - 3600) || dt > (sunset + 3600);
  const isLowLight = isNight || isNearSunrise || isNearSunset;

  // Walleye
  if ((isLowLight || clouds > 75) && (wind >= 10 && wind <= 18)) {
    return { species: "WALLEYE", color: "text-yellow-400" };
  }
  
  // Largemouth Bass
  if (temp > 65 && wind < 12) {
    return { species: "LARGEMOUTH BASS", color: "text-emerald-500" };
  }

  // Northern Pike
  if (temp < 60 && clouds > 50) {
    return { species: "NORTHERN PIKE", color: "text-slate-300" };
  }

  // Panfish/Crappie
  if (wind < 5 && clouds < 30) {
    return { species: "PANFISH / CRAPPIE", color: "text-slate-100" };
  }

  return { species: "MULTI-SPECIES", color: "text-zinc-400" };
}

export function determineLureTactics(targetSpeciesInfo, weatherData) {
  const species = targetSpeciesInfo.species;
  const temp = weatherData.main.temp;
  const clouds = weatherData.clouds.all;
  
  if (species === "WALLEYE") {
    if (clouds > 50) return { lure: "Chartreuse Deep-Diving Crankbait", depth: "12-18 ft" };
    return { lure: "Live Minnow on 1/4oz Jig", depth: "Bottom contour" };
  }
  
  if (species === "LARGEMOUTH BASS") {
    if (temp > 75) return { lure: "Topwater Frog / Buzzbait", depth: "Surface / Weedlines" };
    return { lure: "Texas-Rigged Plastic Worm", depth: "4-10 ft near structure" };
  }
  
  if (species === "NORTHERN PIKE") {
    return { lure: "Large Silver Spoon / Mepps #5", depth: "Mid-water column" };
  }
  
  if (species === "PANFISH / CRAPPIE") {
    return { lure: "1/32oz Tube Jig under slip bobber", depth: "Suspended near cribs" };
  }
  
  // MULTI-SPECIES fallback
  return { lure: "Inline Spinner / Nightcrawler harness", depth: "Various" };
}

export async function fetchNWSAlerts(lat, lon) {
  try {
    const roundedLat = parseFloat(lat).toFixed(4);
    const roundedLon = parseFloat(lon).toFixed(4);
    const res = await fetch(`https://api.weather.gov/alerts/active?point=${roundedLat},${roundedLon}`);
    if (!res.ok) return null;
    const data = await res.json();
    
    if (data && data.features && data.features.length > 0) {
      for (const feature of data.features) {
        const event = feature.properties.event || "";
        const severity = feature.properties.severity || "";
        if (
          event.includes("Special Marine Warning") ||
          event.includes("Tornado Warning") ||
          event.includes("Severe Thunderstorm Warning") ||
          severity === "Extreme" ||
          severity === "Severe"
        ) {
          return feature;
        }
      }
    }
    return null;
  } catch (err) {
    console.error("NWS Fetch Error", err);
    return null;
  }
}

export function calculateWaveHeight(windSpeed, windDegree) {
  let waveHeight = 0;
  if (windDegree > 0 && windDegree < 180) {
    waveHeight = windSpeed * 0.25;
  } else {
    waveHeight = windSpeed * 0.05;
  }
  return Number(waveHeight.toFixed(1));
}

export function checkSmallCraftAdvisory(windSpeed, waveHeight) {
  return windSpeed >= 20 || waveHeight >= 4.0;
}

export function calculatePierSafety(windSpeed, windDegree) {
  if (windDegree > 0 && windDegree < 180) {
    if (windSpeed >= 15) {
      return { status: "CRITICAL: WASH-OVER RISK", color: "text-red-500", border: "border-red-600", bg: "bg-red-950/50" };
    }
    if (windSpeed >= 10) {
      return { status: "CAUTION: ROUGH SURF", color: "text-yellow-500", border: "border-yellow-600", bg: "bg-yellow-950/30" };
    }
    return { status: "SAFE: MODERATE SURF", color: "text-emerald-500", border: "border-emerald-600", bg: "bg-emerald-950/20" };
  }
  return { status: "SAFE: OFFSHORE WIND", color: "text-emerald-500", border: "border-emerald-600", bg: "bg-emerald-950/20" };
}

export function calculateUpwellingDepth(windSpeed, windDegree, currentMonth) {
  let baseDepth = 30;
  switch (currentMonth) {
    case 4:  // May
      baseDepth = 20;
      break;
    case 5:  // June
      baseDepth = 35;
      break;
    case 6:  // July
      baseDepth = 50;
      break;
    case 7:  // August
      baseDepth = 60;
      break;
    case 8:  // September
      baseDepth = 70;
      break;
    case 9:  // October
      baseDepth = 40;
      break;
    default:
      baseDepth = 30;
  }

  let finalDepth = baseDepth;
  if (windDegree > 180 && windDegree < 360) {
    finalDepth = baseDepth - windSpeed * 0.8;
  } else if (windDegree > 0 && windDegree < 180) {
    finalDepth = baseDepth + windSpeed * 0.5;
  }

  const thermocline = Math.round(Math.max(10, finalDepth));
  return {
    thermocline,
    status: windDegree > 180 && windDegree < 360 
      ? "UPWELLING ACTIVE: Cold water rising nearshore. Target shallower bands."
      : windDegree > 0 && windDegree < 180 
      ? "DOWNWELLING ACTIVE: Warm water pushed down. Target deeper bands."
      : "NEUTRAL PROFILE: Thermocline stable near baseline depths."
  };
}

export async function geocodeSearch(query) {
  try {
    const apiKey = import.meta.env.VITE_OPENWEATHER_KEY;
    if (!apiKey) throw new Error("Missing VITE_OPENWEATHER_KEY");

    let url = "";
    if (/^\d{5}$/.test(query)) {
      url = `https://api.openweathermap.org/geo/1.0/zip?zip=${query},US&appid=${apiKey}`;
    } else {
      url = `https://api.openweathermap.org/geo/1.0/direct?q=${query},US&limit=1&appid=${apiKey}`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error("Geocoding failed");
    
    let data = await res.json();
    if (Array.isArray(data)) {
      data = data[0]; // direct returns array
    }

    if (!data || (!data.lat && !data.lon)) return null;

    return {
      id: `custom-${data.lat}-${data.lon}`,
      name: data.name || query,
      lat: data.lat,
      lon: data.lon
    };
  } catch (err) {
    console.error("geocodeSearch error:", err);
    return null;
  }
}

export async function fetchHourlyForecast(lat, lon) {
  try {
    const apiKey = import.meta.env.VITE_OPENWEATHER_KEY;
    if (!apiKey) throw new Error("Missing VITE_OPENWEATHER_KEY");
    
    const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`);
    if (!res.ok) throw new Error("Failed to fetch hourly forecast");
    
    const data = await res.json();
    if (!data.list) return [];
    
    // We want the next 48 hours. The 5-day/3-hour forecast returns 40 items. 16 items = 48 hours.
    return data.list.slice(0, 16).map(item => ({
      dt: item.dt,
      temp: item.main.temp,
      icon: item.weather[0]?.icon,
      pop: item.pop
    }));
  } catch (err) {
    console.error("fetchHourlyForecast error:", err);
    return [];
  }
}
