export type WeatherPayload = {
  current: {
    temp: number;
    humidity: number;
    wind: number;
    condition: string;
    icon: string;
  };
  forecast: Array<{
    date: string;
    temp: number;
    condition: string;
    icon: string;
  }>;
  source: "openweather" | "open-meteo";
  updatedAt: string;
};

type ForecastEntry = {
  dt_txt: string;
  main: { temp: number };
  weather?: Array<{ main: string; icon: string }>;
};

type OpenMeteoCodeMap = { condition: string; icon: string };

const openMeteoCodeMap: Record<number, OpenMeteoCodeMap> = {
  0: { condition: "Clear", icon: "clear" },
  1: { condition: "Mostly Clear", icon: "clear" },
  2: { condition: "Partly Cloudy", icon: "clouds" },
  3: { condition: "Cloudy", icon: "clouds" },
  45: { condition: "Fog", icon: "mist" },
  48: { condition: "Fog", icon: "mist" },
  51: { condition: "Drizzle", icon: "drizzle" },
  53: { condition: "Drizzle", icon: "drizzle" },
  55: { condition: "Drizzle", icon: "drizzle" },
  56: { condition: "Freezing Drizzle", icon: "drizzle" },
  57: { condition: "Freezing Drizzle", icon: "drizzle" },
  61: { condition: "Rain", icon: "rain" },
  63: { condition: "Rain", icon: "rain" },
  65: { condition: "Heavy Rain", icon: "rain" },
  66: { condition: "Freezing Rain", icon: "rain" },
  67: { condition: "Freezing Rain", icon: "rain" },
  71: { condition: "Snow", icon: "snow" },
  73: { condition: "Snow", icon: "snow" },
  75: { condition: "Heavy Snow", icon: "snow" },
  77: { condition: "Snow Grains", icon: "snow" },
  80: { condition: "Rain Showers", icon: "rain" },
  81: { condition: "Rain Showers", icon: "rain" },
  82: { condition: "Heavy Showers", icon: "rain" },
  85: { condition: "Snow Showers", icon: "snow" },
  86: { condition: "Snow Showers", icon: "snow" },
  95: { condition: "Thunderstorm", icon: "storm" },
  96: { condition: "Thunderstorm", icon: "storm" },
  99: { condition: "Thunderstorm", icon: "storm" }
};

async function fetchJson(url: string, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: 900 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function buildOpenWeatherForecast(list: ForecastEntry[]) {
  const grouped = new Map<string, ForecastEntry[]>();

  for (const item of list) {
    const day = item.dt_txt.slice(0, 10);
    const arr = grouped.get(day) ?? [];
    arr.push(item);
    grouped.set(day, arr);
  }

  return Array.from(grouped.values())
    .slice(0, 5)
    .map((entries) => {
      const best = entries.reduce((closest, current) => {
        const hour = Number(current.dt_txt.slice(11, 13));
        const closestHour = Number(closest.dt_txt.slice(11, 13));
        return Math.abs(12 - hour) < Math.abs(12 - closestHour) ? current : closest;
      }, entries[0]);

      return {
        date: best.dt_txt,
        temp: best.main.temp,
        condition: best.weather?.[0]?.main ?? "Unknown",
        icon: best.weather?.[0]?.icon ?? "01d"
      };
    });
}

async function getOpenWeather(city: string, apiKey: string): Promise<WeatherPayload | null> {
  const [currentData, forecastData] = await Promise.all([
    fetchJson(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`
    ),
    fetchJson(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`
    )
  ]);

  if (!currentData || !forecastData) return null;

  const list = (forecastData.list ?? []) as ForecastEntry[];
  const forecast = buildOpenWeatherForecast(list);

  return {
    current: {
      temp: currentData.main.temp,
      humidity: currentData.main.humidity,
      wind: currentData.wind.speed,
      condition: currentData.weather?.[0]?.main ?? "Unknown",
      icon: currentData.weather?.[0]?.icon ?? "01d"
    },
    forecast,
    source: "openweather",
    updatedAt: new Date().toISOString()
  };
}

async function getOpenMeteo(city: string): Promise<WeatherPayload | null> {
  const geo = await fetchJson(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
  );

  const point = geo?.results?.[0];
  if (!point) return null;

  const weather = await fetchJson(
    `https://api.open-meteo.com/v1/forecast?latitude=${point.latitude}&longitude=${point.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`
  );

  if (!weather?.current || !weather?.daily) return null;

  const currentCode = Number(weather.current.weather_code ?? 0);
  const currentInfo = openMeteoCodeMap[currentCode] ?? { condition: "Unknown", icon: "na" };

  const forecast: WeatherPayload["forecast"] = (weather.daily.time ?? []).slice(0, 5).map((date: string, i: number) => {
    const max = Number(weather.daily.temperature_2m_max?.[i] ?? 0);
    const min = Number(weather.daily.temperature_2m_min?.[i] ?? 0);
    const avg = (max + min) / 2;
    const code = Number(weather.daily.weather_code?.[i] ?? 0);
    const info = openMeteoCodeMap[code] ?? { condition: "Unknown", icon: "na" };

    return {
      date,
      temp: avg,
      condition: info.condition,
      icon: info.icon
    };
  });

  return {
    current: {
      temp: Number(weather.current.temperature_2m ?? 0),
      humidity: Number(weather.current.relative_humidity_2m ?? 0),
      wind: Number(weather.current.wind_speed_10m ?? 0),
      condition: currentInfo.condition,
      icon: currentInfo.icon
    },
    forecast,
    source: "open-meteo",
    updatedAt: new Date().toISOString()
  };
}

export async function getCityWeather(city: string): Promise<WeatherPayload | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (apiKey) {
    const weather = await getOpenWeather(city, apiKey);
    if (weather) return weather;
  }

  return getOpenMeteo(city);
}
