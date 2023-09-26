export interface Forecast {
    temperature: number;
    feelTemperature: number;
    pressure: number;
    humidity: number;
    windSpeed: number;
    windDeg: number;
    visibility: number;
    name: string;
    iconLink: string;
    description: string[];
}
