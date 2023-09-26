export function getDewPoint(temperature: number, relativeHumidity: number) {
    const A = 17.27;
    const B = 237.7;

    const relation = (A * temperature) / (B + temperature) + Math.log(+(relativeHumidity / 100).toFixed(2));

    return Math.round((B * relation) / (A - relation));
}
