export interface ForecastResponse {
    cod: number;
    main: {
        feels_like: number;
        humidity: number;
        pressure: number;
        temp: number;
    };
    name: string;
    sys: {
        country: string;
    };
    visibility: number;
    weather: [
        {
            description: string;
            icon: string;
        }
    ];
    wind: {
        speed: number;
        deg: number;
    };
}
