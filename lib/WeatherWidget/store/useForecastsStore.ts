import { ref } from 'vue';
import { fetchForecast } from '../lib';
import type { Forecast, GeoCoordinates } from '../models';

export function useForecastsStore(openWeatherApiKey: string, forecastsLocalstorageKey: string) {
    const isLoading = ref(false);

    const forecasts = ref<Map<string, Forecast>>(new Map());

    function sortForecast(forecastKey: string, startIndex: number, targetIndex: number) {
        const forecast = forecasts.value.get(forecastKey);

        if (!forecast) return;

        const forecastsArray = Array.from(forecasts.value.entries())
            .toSpliced(startIndex, 1)
            .toSpliced(targetIndex, 0, [forecastKey, forecast]);

        forecasts.value = new Map(forecastsArray);
    }

    function deleteForecast(forecastKey: string) {
        forecasts.value.delete(forecastKey);
    }

    async function loadForecast(position: GeoCoordinates | string) {
        isLoading.value = true;

        const forecast = await fetchForecast(position, openWeatherApiKey);

        if (forecast) forecasts.value.set(forecast.name, forecast);

        isLoading.value = false;
    }

    function saveForecastsToLocalstorage() {
        /* an old version
        const initPlaceList: string[] = JSON.parse(String(localStorage.getItem(forecastsLocalstorageKey))) || [];

        const concatPlaceList = initPlaceList.concat(Array.from(forecasts.value.keys()));

        const resultPlaceList = Array.from(new Set(concatPlaceList));

        localStorage.setItem(forecastsLocalstorageKey, JSON.stringify(resultPlaceList)); 
        */

        localStorage.setItem(forecastsLocalstorageKey, JSON.stringify(Array.from(forecasts.value.keys())));
    }

    async function loadForecastsFromLocalstorage() {
        const placeList: string[] = JSON.parse(String(localStorage.getItem(forecastsLocalstorageKey))) || [];

        if (placeList.length) {
            isLoading.value = true;

            for await (const place of placeList) {
                const forecast = await fetchForecast(place, openWeatherApiKey);

                if (forecast) forecasts.value.set(forecast.name, forecast);
            }

            isLoading.value = false;
        }
    }

    return {
        isLoading,
        forecasts,
        sortForecast,
        deleteForecast,
        loadForecast,
        saveForecastsToLocalstorage,
        loadForecastsFromLocalstorage
    };
}
