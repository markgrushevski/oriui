## Weather Widget

```js
import { WeatherWidget } from './WeatherWidget';
```

Main component — `WeatherWidget`  
Main views — `CardForecast`, `CardPlacesEditor`

###### Folders:

-   `components`
-   `lib` — utility functions
-   `models` — definitions for JSDoc and IDE hints
-   `ui`, `icons` — reusable components

###### User can:

-   Remove previously added cities.
-   Reorder the cities by dragging and dropping them within the list using ‘Hamburger’ icon to the left from the city name.
-   Add new locations.
-   Save the configuration in the Local Storage and restore it on future visits. User able to configure the widget just once and then have the same view until they change the computer or clean the storage.
-   By default, on initial opening, request the current user’s location and display the weather in their city.
