<script setup lang="ts">
import { HeaderCard, IconPressure, IconWind } from '../ui';
import type { Forecast } from '../models';

defineProps<{
    forecast: Forecast;
    cardinalDirection: string;
    dewPoint: number;
}>();
</script>

<template>
    <div :class="CardForecast.card">
        <HeaderCard :text="forecast.name" />
        <div :class="CardForecast.weather">
            <div :class="CardForecast['weather-icon-wrapper']"><img :src="forecast.iconLink" alt="" /></div>
            <div :class="CardForecast['weather-temperature']">{{ forecast.temperature }}&deg;C</div>
        </div>
        <div :class="CardForecast.description">
            <span>Feels like: {{ forecast.feelTemperature }}&deg;C. </span>
            <span v-for="description in forecast.description" :key="description">{{ description }}. </span>
        </div>
        <div :class="CardForecast.details">
            <div>
                <IconWind :angle="forecast.windDeg" />
                {{ forecast.windSpeed }}m/s {{ cardinalDirection }}
            </div>
            <div>
                <IconPressure />
                {{ forecast.pressure }}hPa
            </div>
            <div>Humidity: {{ forecast.humidity }}%</div>
            <div>Dew point: {{ dewPoint }}&deg;C</div>
            <div>Visibility: {{ forecast.visibility }}km</div>
        </div>
    </div>
</template>

<style module="CardForecast">
.card {
    width: 100%;
}

.card:not(:first-of-type) {
    margin-top: 40px;
}

.weather {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
}

.weather-icon-wrapper {
    width: 120px;
    height: 120px;
}

.weather-icon-wrapper > img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.weather-temperature {
    color: var(--text-primary);
    font-size: 3em;
}

.details {
    display: grid;
    grid-template-columns: auto auto;
    gap: 10px;
    margin-top: 10px;
}

.details > div {
    display: flex;
    align-items: center;
}
</style>
