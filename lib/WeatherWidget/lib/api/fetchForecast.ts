import type { Forecast, ForecastResponse, GeoCoordinates } from '../../models';

export async function fetchForecast(
    position: GeoCoordinates | string,
    openWeatherApiKey: string
): Promise<Forecast | null> {
    let forecastData = null;

    const positionParam = typeof position === 'string' ? `q=${position}` : `lat=${position.lat}&lon=${position.lon}`;

    await fetch(
        `https://api.openweathermap.org/data/2.5/weather?units=metric&${positionParam}&appid=${openWeatherApiKey}`
    )
        .then((res) => res.json() as Promise<ForecastResponse>)
        .then((res) => {
            if (res.cod === 200) {
                forecastData = {
                    temperature: Math.round(res.main.temp),
                    feelTemperature: Math.round(res.main.feels_like),
                    pressure: res.main.pressure,
                    humidity: res.main.humidity,
                    windSpeed: Math.round(res.wind.speed),
                    windDeg: res.wind.deg,
                    visibility: +(res.visibility / 1000).toFixed(2),
                    name: `${res.name}, ${res.sys.country}`,
                    iconLink: `https://openweathermap.org/img/wn/${res.weather[0].icon}@4x.png`,
                    description: res.weather.map(
                        (weatherItem) => weatherItem.description[0].toUpperCase() + weatherItem.description.substring(1)
                    )
                };
            }
        });

    return forecastData;
}
