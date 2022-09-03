<template>
    <div ref="can-zaman-arayuzu">
        <div class="can-zaman-arayuzu">
            <div class="can-cubugu can-cubugu-1">
                <div class="ic-can-cubugu-1" :style="{width: (warriors[0]?.can ?? 0) + '%'}"></div>
                <span class="can-cubugu-isim can-cubugu-isim-1">{{ warriors[0]?.isim ?? '' }}</span>
            </div>
            <div class="zaman-kutusu">
                <span id="zaman" class="zaman">90</span>
            </div>
            <div class="can-cubugu can-cubugu-2">
                <div class="ic-can-cubugu-2" :style="{width: (warriors[1]?.can ?? 0) + '%'}"></div>
                <span class="can-cubugu-isim can-cubugu-isim-2">{{ warriors[1]?.isim ?? '' }}</span>
            </div>
        </div>

        <div class="warrior-stats" v-for="warrior in warriors" :key="warrior.isim"
             :style="warriorStatStyle(warrior)">

            <div class="warrior-respawn-time">
                {{ `K:${warrior.score.kill} Ö:${warrior.score.death}` }}
            </div>
            <div class="warrior-scores">
                {{ warrior.can <= 0 ? warrior.respawnTimeLeft : '' }}
            </div>
            <div class="warrior-hearts mt-2">
                <img src="sprites/minecraft-kalp-dolu.png" alt="heart" :class="{grayscale: warrior.can <= 0}">
                <img src="sprites/minecraft-kalp-dolu.png" alt="heart" :class="{grayscale: warrior.can <= 25}">
                <img src="sprites/minecraft-kalp-dolu.png" alt="heart" :class="{grayscale: warrior.can <= 50}">
                <img src="sprites/minecraft-kalp-dolu.png" alt="heart" :class="{grayscale: warrior.can <= 75}">
            </div>
            <div class="warrior-stats-name">
                {{ warrior.isim }}
            </div>
        </div>

        <div class="tam-ekran-butonu">
            <v-icon v-if="!tamEkrandir" dark right large @click="$emit('tam-ekrani-ac')">
                mdi-fullscreen
            </v-icon>
            <v-icon v-else dark right large @click="$emit('tam-ekrani-kapat')">
                mdi-fullscreen-exit
            </v-icon>
        </div>

    </div>

</template>
<script lang="ts">
import Vue from "vue";
import {Warrior} from "@/js/kilicli-kavga/warrior";

const tuvalYuksekligi = 720;
const tuvalGenisligi = tuvalYuksekligi * 16 / 9;

export default Vue.extend({
    name: 'KilicliKavgaOyunuArayuzCanZaman',
    props: {
        tamEkrandir: Boolean,
        warriors: {
            type: Array as () => Warrior[],
            default() {
                return [];
            }
        }
    },
    data() {
        return {
            canvasClientWidth: 1000
        }
    },
    methods: {
        refreshCanvasClientWidth() {
            this.canvasClientWidth = (this.$refs['can-zaman-arayuzu'] as HTMLDivElement).clientWidth;
        },
        warriorStatStyle(warrior: Warrior) {
            const style = {
                position: 'absolute',
            } as any;
            const scale = this.canvasClientWidth / warrior.tuval.canvas.width;
            style.top = warrior.hitbox.pos.y * scale + 'px';
            style.left = (warrior.hitbox.pos.x + warrior.hitbox.w / 2) * scale + 'px';


            return style;

        }
    },
    mounted() {
        this.refreshCanvasClientWidth();
        new ResizeObserver(() => this.refreshCanvasClientWidth)
                .observe(this.$refs['can-zaman-arayuzu'] as HTMLDivElement);
        window.addEventListener('resize', this.refreshCanvasClientWidth); // in case ResizeObserver is not supported
    },
    destroyed() {
        window.removeEventListener('resize', this.refreshCanvasClientWidth);
    }
})
</script>
<style scoped>
* {
    --zaman-genisligi: 10%;
    --can-cubugu-yuksekligi: min(2.8vw, 2rem);
    --font-boyutu: var(--can-cubugu-yuksekligi);
    --can-cubugu-kenar-kalinligi: 3px;
}

.can-zaman-arayuzu {
    position: absolute;
    top: 1%;
    left: 1%;
    right: 1%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #e8e8e8;
    font-family: "Minecraft", Avenir, Helvetica, Arial, sans-serif;
    font-size: var(--font-boyutu);
}

.can-cubugu {
    background-color: black;
    height: 100%;
    width: 100%;
    padding: var(--can-cubugu-kenar-kalinligi);

}

.can-cubugu-1 {
    padding-right: 0;
}

.can-cubugu-2 {
    padding-left: 0;
}

.ic-can-cubugu-1, .ic-can-cubugu-2 {
    width: 100%;
    height: var(--can-cubugu-yuksekligi);
    background-color: rgba(255, 84, 84, 0.82);
    transition: width 0.2s ease-in-out;
}

.ic-can-cubugu-1 {

}

.ic-can-cubugu-2 {
    float: right;
}

.zaman-kutusu {
    padding: calc(var(--can-cubugu-yuksekligi) / 4);

    border: black solid var(--can-cubugu-kenar-kalinligi);
    background-color: slategray;
    text-align: center;
}

.zaman {
    position: relative;
    top: 0.05rem;
}

.can-cubugu-isim {
    position: absolute;
    top: calc(50% + 0.05rem);
    transform: translate(0, -50%);
}

.can-cubugu-isim-1 {
    left: calc(var(--can-cubugu-kenar-kalinligi) * 2);
}

.can-cubugu-isim-2 {
    right: calc(var(--can-cubugu-kenar-kalinligi) * 2);
}

.tam-ekran-butonu {
    position: absolute;
    right: 8px;
    bottom: 8px;
}

.tam-ekran-butonu * {
    font-size: min(5vw, 40px) !important;
}

.v-btn:before {
    opacity: 0 !important;
}

.v-ripple__container {
    opacity: 0 !important;
}

.warrior-stats {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 1rem;
    color: #f8f8f8;
    transform: translate(-50%, -100%);
}

.warrior-stats > * {
    margin-bottom: -0.25rem;

}

.warrior-hearts {

}

.warrior-hearts img {
    width: 0.9rem;
    height: 0.9rem;
}

.grayscale {
    filter: grayscale(100%);
}

</style>
