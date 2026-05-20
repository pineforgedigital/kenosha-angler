// Kenosha Angler Solunar Math Engine

const LUNAR_CYCLE = 29.53058867;
// Reference new moon: Jan 11, 2024, 11:57 UTC
const BASE_NEW_MOON = new Date('2024-01-11T11:57:00Z');
const MS_PER_DAY = 86400000;

export function calculateMoonPhase(date = new Date()) {
  const diffMs = date.getTime() - BASE_NEW_MOON.getTime();
  const diffDays = diffMs / MS_PER_DAY;
  
  let cyclePosition = diffDays % LUNAR_CYCLE;
  if (cyclePosition < 0) {
    cyclePosition += LUNAR_CYCLE;
  }

  // Illumination calculation based on lunar cycle position
  // 0 at new moon, 1 at full moon
  const illumination = 0.5 * (1 - Math.cos((2 * Math.PI * cyclePosition) / LUNAR_CYCLE));
  const illuminationPercentage = Math.round(illumination * 100);

  let phaseName = "";
  let biteMultiplier = 1.0;

  if (cyclePosition < 1.5 || cyclePosition > LUNAR_CYCLE - 1.5) {
    phaseName = "New Moon";
    biteMultiplier = 1.5;
  } else if (cyclePosition >= 1.5 && cyclePosition < 5.88) {
    phaseName = "Waxing Crescent";
    biteMultiplier = 0.9;
  } else if (cyclePosition >= 5.88 && cyclePosition < 8.88) {
    phaseName = "First Quarter";
    biteMultiplier = 1.0;
  } else if (cyclePosition >= 8.88 && cyclePosition < 13.26) {
    phaseName = "Waxing Gibbous";
    biteMultiplier = 1.2;
  } else if (cyclePosition >= 13.26 && cyclePosition < 16.26) {
    phaseName = "Full Moon";
    biteMultiplier = 1.5;
  } else if (cyclePosition >= 16.26 && cyclePosition < 20.64) {
    phaseName = "Waning Gibbous";
    biteMultiplier = 1.2;
  } else if (cyclePosition >= 20.64 && cyclePosition < 23.64) {
    phaseName = "Third Quarter";
    biteMultiplier = 1.0;
  } else {
    phaseName = "Waning Crescent";
    biteMultiplier = 0.9;
  }

  return {
    phaseName,
    illuminationPercentage,
    biteMultiplier
  };
}

export function calculateFeedWindows(date = new Date()) {
  const diffMs = date.getTime() - BASE_NEW_MOON.getTime();
  const diffDays = diffMs / MS_PER_DAY;
  
  let cyclePosition = diffDays % LUNAR_CYCLE;
  if (cyclePosition < 0) {
    cyclePosition += LUNAR_CYCLE;
  }

  // Lunar transit hour is approximately: (12 + (age / 29.53) * 24) % 24
  const transitHour = (12 + (cyclePosition / LUNAR_CYCLE) * 24) % 24;
  const antiTransitHour = (transitHour + 12) % 24;
  const moonriseHour = (transitHour - 6 + 24) % 24;
  const moonsetHour = (transitHour + 6) % 24;

  const formatTimeWindow = (centerHour, durationHours) => {
    const startHour = (centerHour - durationHours / 2 + 24) % 24;
    const endHour = (centerHour + durationHours / 2 + 24) % 24;
    
    const formatTime = (h) => {
      let hh = Math.floor(h);
      let mm = Math.round((h % 1) * 60);
      if (mm === 60) {
        hh = (hh + 1) % 24;
        mm = 0;
      }
      const paddedMm = mm < 10 ? `0${mm}` : mm;
      const ampm = hh >= 12 ? 'PM' : 'AM';
      const displayH = hh % 12 === 0 ? 12 : hh % 12;
      return `${displayH}:${paddedMm} ${ampm}`;
    };

    return `${formatTime(startHour)} - ${formatTime(endHour)}`;
  };

  return {
    major1: formatTimeWindow(transitHour, 2),
    major2: formatTimeWindow(antiTransitHour, 2),
    minor1: formatTimeWindow(moonriseHour, 1),
    minor2: formatTimeWindow(moonsetHour, 1)
  };
}
