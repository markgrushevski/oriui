export function getCardinalDirection(angle: number) {
    const cardinals = [
        'N',
        'NNE',
        'NE',
        'ENE',
        'E',
        'ESE',
        'SE',
        'SSE',
        'S',
        'SSW',
        'SW',
        'WSW',
        'W',
        'WNW',
        'NW',
        'NNW'
    ] as const;

    /** Angle width of each cardinal's area */
    const arcWidth = 360 / cardinals.length;

    const index = Math.round((angle % 360 < 0 ? angle + 360 : angle) / arcWidth) % cardinals.length;

    return cardinals[index];
}
