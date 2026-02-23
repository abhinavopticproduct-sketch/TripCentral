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
};

type ForecastEntry = {
  dt_txt: string;
  main: { temp: number };
  weather?: Array<{ main: string; icon: string }>;
};

export async function getCityWeather(city: string): Promise<WeatherPayload | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return null;

  const currentRes = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`,
    { next: { revalidate: 900 } }
  );

  if (!currentRes.ok) return null;
  const currentData = await currentRes.json();

  const forecastRes = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`,
    { next: { revalidate: 900 } }
  );

  const forecastData = forecastRes.ok ? await forecastRes.json() : null;
  const list = (forecastData?.list ?? []) as ForecastEntry[];
  const noonForecast = list.filter((entry) => entry.dt_txt.includes("12:00:00")).slice(0, 5);

  return {
    current: {
      temp: currentData.main.temp,
      humidity: currentData.main.humidity,
      wind: currentData.wind.speed,
      condition: currentData.weather?.[0]?.main ?? "Unknown",
      icon: currentData.weather?.[0]?.icon ?? "01d"
    },
    forecast: noonForecast.map((entry) => ({
      date: entry.dt_txt,
      temp: entry.main.temp,
      condition: entry.weather?.[0]?.main ?? "Unknown",
      icon: entry.weather?.[0]?.icon ?? "01d"
    }))
  };
}