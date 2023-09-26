<script setup lang="ts">
import { useForecastsStore } from './store';
import { onBeforeMount, onBeforeUnmount, ref } from 'vue';
import { CardForecast, CardPlacesEditor } from './components';
import { getCardinalDirection, getDewPoint } from './lib';
import { HeaderCard, IconClose, IconSettings } from './ui';

// TODO: add loading icon, add soft transitions

const props = withDefaults(
    defineProps<{
        forecastsLocalstorageKey?: string;
        openWeatherApiKey?: string;
        refetchWeatherTime?: number;
        theme?: 'light' | 'dark';
    }>(),
    {
        forecastsLocalstorageKey: 'weatherPlaceList',
        openWeatherApiKey: '78d3f269e9f561ffcbc55e99c61c5d0b',
        refetchWeatherTime: 30_000,
        theme: 'light'
    }
);

const showSettings = ref(false);

const {
    isLoading,
    forecasts,
    sortForecast,
    deleteForecast,
    loadForecast,
    saveForecastsToLocalstorage,
    loadForecastsFromLocalstorage
} = useForecastsStore(props.openWeatherApiKey, props.forecastsLocalstorageKey);

onBeforeMount(() => {
    if (localStorage.getItem(props.forecastsLocalstorageKey)?.length) {
        loadForecastsFromLocalstorage();
    } else if (typeof localStorage.getItem(props.forecastsLocalstorageKey) !== 'string') {
        navigator.geolocation.getCurrentPosition((geoData) => {
            loadForecast({ lat: geoData.coords.latitude, lon: geoData.coords.longitude }).then(() => {
                saveForecastsToLocalstorage();
            });
        });
    }
});

const refetchWeathers = setInterval(() => {
    for (const cityName of forecasts.value.keys()) loadForecast(cityName);
}, props.refetchWeatherTime);

onBeforeUnmount(() => clearInterval(refetchWeathers));
</script>

<template>
    <div :class="{ [WeatherWidget.widget]: true, [WeatherWidget['widget_dark']]: theme === 'dark' }">
        <IconClose v-if="showSettings" :class="WeatherWidget.icon" @click="showSettings = !showSettings" />
        <IconSettings v-else :class="WeatherWidget.icon" @click="showSettings = !showSettings" />

        <HeaderCard
            v-if="!forecasts.size && !showSettings"
            :class="WeatherWidget['empty-tip-wrapper']"
            text="Add a new place →"
        />

        <CardForecast
            v-for="[name, forecast] in forecasts.entries()"
            :key="name"
            :forecast="forecast"
            :cardinal-direction="getCardinalDirection(forecast.windDeg)"
            :dew-point="getDewPoint(forecast.temperature, forecast.humidity)"
            :class="WeatherWidget.card"
            :style="showSettings ? 'visibility: hidden' : ''"
        />

        <CardPlacesEditor
            v-show="showSettings"
            :class="WeatherWidget.card"
            :place-name-list="Array.from(forecasts.keys())"
            :loading="isLoading"
            @add="
                (userInput) => {
                    loadForecast(userInput).then(() => {
                        saveForecastsToLocalstorage();
                    });
                }
            "
            @delete="
                (placeName) => {
                    deleteForecast(placeName);
                    saveForecastsToLocalstorage();
                }
            "
            @dragend="
                (placeName, startIndex, targetIndex) => {
                    sortForecast(placeName, startIndex, targetIndex);
                    saveForecastsToLocalstorage();
                }
            "
        />
    </div>
</template>

<style module="WeatherWidget">
.widget {
    --text-primary: hsl(0deg 0% 15%);
    --text-secondary: hsl(0deg 0% 28%);
    --text-tertiary: hsl(0deg 0% 66%);
    --bg-secondary: hsl(0deg 0% 94%);
    --bg-primary: hsl(0deg 0% 100%);

    display: flex;
    position: relative;
    flex-direction: column;
    align-items: center;

    width: 270px;
    padding: 8px;
    border-radius: 20px;

    background-color: var(--bg-primary);

    /* box-shadow: hsl(0deg 0% 0% / 16%) 0 1px 4px; */
    fill: var(--text-secondary);
}

.widget_dark {
    --text-primary: hsl(0deg 0% 94%);
    --text-secondary: hsl(0deg 0% 66%);
    --text-tertiary: hsl(0deg 0% 28%);
    --bg-secondary: hsl(0deg 0% 15%);
    --bg-primary: hsl(0deg 0% 10%);
    box-shadow: none;

    text-shadow: none;
}

.icon {
    position: absolute;
    z-index: 2;

    align-self: flex-end;

    width: 1.75em;
    height: 1.75em;

    cursor: pointer;
}

.empty-tip-wrapper {
    color: var(--text-tertiary);
}

.card {
    display: flex;
    flex-direction: column;
    color: var(--text-secondary);
}
</style>
