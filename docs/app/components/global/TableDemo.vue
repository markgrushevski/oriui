<script setup lang="ts">
// Live Table demos for the docs (MDC renders it as `:table-demo{kind="…"}`). MDC cannot hold a table's
// `thead` / `tbody` inside `::ori-table` (the HTML parser drops them), so every demo built on OriTable lives
// here; the plain-markup demo on the page is a native table with the classes and needs no component.
import { OriAvatar, OriTable, OriTag } from '@oriui/vue'

const { kind = 'numbers' } = defineProps<{
    kind?: 'colors' | 'current' | 'hidden' | 'leaderboard' | 'numbers' | 'rows' | 'sizes' | 'sticky' | 'wide'
}>()

const colors = ['primary', 'secondary', 'success', 'warning', 'danger', 'info']

const customers = ['Mira Chen', 'Tomas Reyes', 'Noor Haddad', 'Ines Alves', 'Ben Okafor']
const orders = Array.from({ length: 14 }, (_, i) => ({
    id: `#${1001 + i}`,
    customer: customers[i % customers.length],
    total: `$${(40 + ((i * 37) % 160)).toFixed(2)}`
}))

const players = [
    { rank: 1, name: 'Mira Chen', rating: 2140, record: '34–12', you: false },
    { rank: 2, name: 'Tomas Reyes', rating: 2098, record: '31–15', you: false },
    { rank: 3, name: 'Noor Haddad', rating: 2054, record: '29–17', you: true },
    { rank: 4, name: 'Ines Alves', rating: 1987, record: '27–20', you: false },
    { rank: 5, name: 'Ben Okafor', rating: 1932, record: '24–22', you: false }
]
</script>

<template>
    <OriTable v-if="kind === 'numbers'" caption="Quarterly sales" style="width: 100%; max-width: 28rem">
        <thead>
            <tr>
                <th scope="col">Region</th>
                <th scope="col" class="ori-table__num">Units</th>
                <th scope="col" class="ori-table__num">Revenue</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <th scope="row">North</th>
                <td class="ori-table__num">1,284</td>
                <td class="ori-table__num">$48,210</td>
            </tr>
            <tr>
                <th scope="row">South</th>
                <td class="ori-table__num">962</td>
                <td class="ori-table__num">$35,870</td>
            </tr>
            <tr>
                <th scope="row">East</th>
                <td class="ori-table__num">2,047</td>
                <td class="ori-table__num">$79,305</td>
            </tr>
        </tbody>
        <tfoot>
            <tr>
                <th scope="row">Total</th>
                <td class="ori-table__num">4,293</td>
                <td class="ori-table__num">$163,385</td>
            </tr>
        </tfoot>
    </OriTable>

    <div v-else-if="kind === 'rows'" style="display: grid; gap: 1.5rem; width: 100%; max-width: 36rem">
        <OriTable caption="Striped" striped>
            <thead>
                <tr>
                    <th scope="col">Task</th>
                    <th scope="col">Owner</th>
                    <th scope="col">Status</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Write the release notes</td>
                    <td>Mira</td>
                    <td>Done</td>
                </tr>
                <tr>
                    <td>Review pull requests</td>
                    <td>Tomas</td>
                    <td>In progress</td>
                </tr>
                <tr>
                    <td>Update the roadmap</td>
                    <td>Noor</td>
                    <td>Not started</td>
                </tr>
                <tr>
                    <td>Fix the login redirect</td>
                    <td>Ines</td>
                    <td>In progress</td>
                </tr>
            </tbody>
        </OriTable>
        <OriTable caption="Hover" hover>
            <thead>
                <tr>
                    <th scope="col">Task</th>
                    <th scope="col">Owner</th>
                    <th scope="col">Status</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Write the release notes</td>
                    <td>Mira</td>
                    <td>Done</td>
                </tr>
                <tr>
                    <td>Review pull requests</td>
                    <td>Tomas</td>
                    <td>In progress</td>
                </tr>
                <tr>
                    <td>Update the roadmap</td>
                    <td>Noor</td>
                    <td>Not started</td>
                </tr>
                <tr>
                    <td>Fix the login redirect</td>
                    <td>Ines</td>
                    <td>In progress</td>
                </tr>
            </tbody>
        </OriTable>
        <OriTable caption="Striped and hover" striped hover>
            <thead>
                <tr>
                    <th scope="col">Task</th>
                    <th scope="col">Owner</th>
                    <th scope="col">Status</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Write the release notes</td>
                    <td>Mira</td>
                    <td>Done</td>
                </tr>
                <tr>
                    <td>Review pull requests</td>
                    <td>Tomas</td>
                    <td>In progress</td>
                </tr>
                <tr>
                    <td>Update the roadmap</td>
                    <td>Noor</td>
                    <td>Not started</td>
                </tr>
                <tr>
                    <td>Fix the login redirect</td>
                    <td>Ines</td>
                    <td>In progress</td>
                </tr>
            </tbody>
        </OriTable>
    </div>

    <div v-else-if="kind === 'sizes'" style="display: grid; gap: 1.5rem; width: 100%; max-width: 28rem">
        <OriTable caption="sm" size="sm">
            <thead>
                <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Role</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Mira Chen</td>
                    <td>Design</td>
                </tr>
                <tr>
                    <td>Tomas Reyes</td>
                    <td>Engineering</td>
                </tr>
            </tbody>
        </OriTable>
        <OriTable caption="md (default)">
            <thead>
                <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Role</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Mira Chen</td>
                    <td>Design</td>
                </tr>
                <tr>
                    <td>Tomas Reyes</td>
                    <td>Engineering</td>
                </tr>
            </tbody>
        </OriTable>
        <OriTable caption="lg" size="lg">
            <thead>
                <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Role</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Mira Chen</td>
                    <td>Design</td>
                </tr>
                <tr>
                    <td>Tomas Reyes</td>
                    <td>Engineering</td>
                </tr>
            </tbody>
        </OriTable>
    </div>

    <OriTable
        v-else-if="kind === 'sticky'"
        caption="Recent orders"
        sticky-header
        striped
        max-height="200px"
        style="width: 100%"
    >
        <thead>
            <tr>
                <th scope="col">Order</th>
                <th scope="col">Customer</th>
                <th scope="col" class="ori-table__num">Total</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="order in orders" :key="order.id">
                <th scope="row">{{ order.id }}</th>
                <td>{{ order.customer }}</td>
                <td class="ori-table__num">{{ order.total }}</td>
            </tr>
        </tbody>
    </OriTable>

    <OriTable v-else-if="kind === 'current'" caption="Plans" style="width: 100%; max-width: 32rem">
        <thead>
            <tr>
                <th scope="col">Plan</th>
                <th scope="col" class="ori-table__num">Price</th>
                <th scope="col" class="ori-table__num">Seats</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <th scope="row">Free</th>
                <td class="ori-table__num">$0</td>
                <td class="ori-table__num">1</td>
            </tr>
            <tr aria-current="true">
                <th scope="row">Pro <OriTag label="Current plan" size="xs" /></th>
                <td class="ori-table__num">$12</td>
                <td class="ori-table__num">5</td>
            </tr>
            <tr>
                <th scope="row">Team</th>
                <td class="ori-table__num">$48</td>
                <td class="ori-table__num">25</td>
            </tr>
        </tbody>
    </OriTable>

    <div v-else-if="kind === 'colors'" style="display: flex; flex-wrap: wrap; gap: 1.5rem; width: 100%">
        <OriTable
            v-for="color in colors"
            :key="color"
            :caption="color"
            :class="`ori-color_${color}`"
            style="width: 13rem"
        >
            <tbody>
                <tr aria-current="true">
                    <td>Current row</td>
                </tr>
                <tr>
                    <td>Another row</td>
                </tr>
            </tbody>
        </OriTable>
    </div>

    <div v-else-if="kind === 'hidden'" style="width: 100%; max-width: 28rem">
        <OriTable caption="Team members" caption-hidden>
            <thead>
                <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Role</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Mira Chen</td>
                    <td>Design</td>
                </tr>
                <tr>
                    <td>Tomas Reyes</td>
                    <td>Engineering</td>
                </tr>
            </tbody>
        </OriTable>
        <p style="margin: 0.5rem 0 0; font-size: 0.85em">
            Announced as <strong>Team members</strong>; nothing is drawn.
        </p>
    </div>

    <div v-else-if="kind === 'wide'" style="width: 100%; max-width: 22rem">
        <OriTable caption="Recent orders" style="white-space: nowrap">
            <thead>
                <tr>
                    <th scope="col">Order</th>
                    <th scope="col">Customer</th>
                    <th scope="col">Email</th>
                    <th scope="col">Date</th>
                    <th scope="col">Status</th>
                    <th scope="col" class="ori-table__num">Total</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th scope="row">#1001</th>
                    <td>Mira Chen</td>
                    <td>mira@example.com</td>
                    <td>12 Mar 2026</td>
                    <td>Shipped</td>
                    <td class="ori-table__num">$84.00</td>
                </tr>
                <tr>
                    <th scope="row">#1002</th>
                    <td>Tomas Reyes</td>
                    <td>tomas@example.com</td>
                    <td>13 Mar 2026</td>
                    <td>Processing</td>
                    <td class="ori-table__num">$127.50</td>
                </tr>
                <tr>
                    <th scope="row">#1003</th>
                    <td>Noor Haddad</td>
                    <td>noor@example.com</td>
                    <td>14 Mar 2026</td>
                    <td>Delivered</td>
                    <td class="ori-table__num">$61.25</td>
                </tr>
            </tbody>
        </OriTable>
    </div>

    <OriTable v-else caption="Leaderboard" hover style="width: 100%; max-width: 36rem">
        <thead>
            <tr>
                <th scope="col" class="ori-table__num">Rank</th>
                <th scope="col">Player</th>
                <th scope="col" class="ori-table__num">Rating</th>
                <th scope="col" class="ori-table__num">Wins–losses</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="player in players" :key="player.rank" :aria-current="player.you ? 'true' : undefined">
                <td class="ori-table__num">{{ player.rank }}</td>
                <th scope="row">
                    <div style="display: flex; gap: 0.5rem; align-items: center">
                        <OriAvatar :name="player.name" size="sm" />
                        <span>{{ player.name }}</span>
                        <OriTag v-if="player.you" label="You" size="xs" />
                    </div>
                </th>
                <td class="ori-table__num">{{ player.rating }}</td>
                <td class="ori-table__num">{{ player.record }}</td>
            </tr>
        </tbody>
    </OriTable>
</template>
