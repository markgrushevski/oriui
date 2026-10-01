<script lang="ts" setup>
import { ref } from 'vue'
import { OriTable } from '@oriui/vue'

// A wide table in a narrow box (it scrolls sideways), a table that fits (it must add no tab stop), and a
// tall table with a sticky header in a 200px box. `wide` toggles the first box's width live, so the
// region and tab stop must follow a resize.
const narrow = ref(true)
const rows = Array.from({ length: 30 }, (_, i) => ({ rank: i + 1, name: `Player ${i + 1}`, rating: 2000 - i * 7 }))
</script>

<template>
    <div style="padding: 40px">
        <button type="button" data-testid="before" @click="narrow = !narrow">Toggle width</button>

        <div data-testid="wide-box" :style="{ width: narrow ? '240px' : '900px' }">
            <OriTable caption="Leaderboard" data-testid="wide">
                <thead>
                    <tr>
                        <th scope="col" class="ori-table__num">Rank</th>
                        <th scope="col">Player</th>
                        <th scope="col">Country</th>
                        <th scope="col" class="ori-table__num">Rating</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="r in rows.slice(0, 3)" :key="r.rank" :aria-current="r.rank === 2 ? 'true' : undefined">
                        <td class="ori-table__num">{{ r.rank }}</td>
                        <td>{{ r.name }}</td>
                        <td>Somewhere far away</td>
                        <td class="ori-table__num">{{ r.rating }}</td>
                    </tr>
                </tbody>
            </OriTable>
        </div>

        <OriTable caption="Fits" data-testid="fits">
            <tbody>
                <tr>
                    <td>One</td>
                    <td>Two</td>
                </tr>
            </tbody>
        </OriTable>

        <OriTable caption="Tall" caption-hidden sticky-header max-height="200px" striped data-testid="tall">
            <thead>
                <tr>
                    <th scope="col">Player</th>
                    <th scope="col" class="ori-table__num">Rating</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="r in rows" :key="r.rank">
                    <td>{{ r.name }}</td>
                    <td class="ori-table__num">{{ r.rating }}</td>
                </tr>
            </tbody>
        </OriTable>

        <button type="button" data-testid="after">After</button>
    </div>
</template>
