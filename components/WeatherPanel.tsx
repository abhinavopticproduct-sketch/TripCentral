import { getCityWeather } from "@/lib/weather";

export async function WeatherPanel({ city }: { city: string }) {
  const weather = await getCityWeather(city);

  if (!weather) {
    return <div className="card p-4 text-sm text-slate-600">Weather unavailable. Add `OPENWEATHER_API_KEY` in `.env.local`.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <p className="text-sm text-slate-600">Current Weather</p>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <p className="text-3xl font-semibold">{weather.current.temp.toFixed(1)}°C</p>
          <p className="rounded-xl bg-slate-100 px-3 py-1 text-sm">{weather.current.condition}</p>
          <p className="text-sm">Humidity: {weather.current.humidity}%</p>
          <p className="text-sm">Wind: {weather.current.wind} m/s</p>
        </div>
      </div>

      <div className="card p-5">
        <p className="mb-3 text-sm font-medium">5-Day Forecast</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {weather.forecast.map((day) => (
            <div key={day.date} className="rounded-xl border border-slate-100 p-3 text-sm">
              <p className="font-medium">{new Date(day.date).toLocaleDateString()}</p>
              <p>{day.condition}</p>
              <p>{day.temp.toFixed(1)}°C</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}