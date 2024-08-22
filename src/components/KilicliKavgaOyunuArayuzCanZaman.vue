<template>
    <div ref="can-zaman-arayuzu">
        <div class="can-zaman-arayuzu">
            <div class="can-cubugu can-cubugu-1">
                <div class="ic-can-cubugu-1" :style="{ width: (warriors[0]?.can ?? 0) + '%' }"></div>
                <span class="can-cubugu-isim can-cubugu-isim-1">{{ warriors[0]?.isim ?? '' }}</span>
            </div>
            <div class="zaman-kutusu">
                <span id="zaman" class="zaman">90</span>
            </div>
            <div class="can-cubugu can-cubugu-2">
                <div class="ic-can-cubugu-2" :style="{ width: (warriors[1]?.can ?? 0) + '%' }"></div>
                <span class="can-cubugu-isim can-cubugu-isim-2">{{ warriors[1]?.isim ?? '' }}</span>
            </div>
        </div>

        <div class="warrior-stats" v-for="warrior in warriors" :key="warrior.isim" :style="warriorStatStyle(warrior)">

            
            <div class="warrior-scores">
                {{ warrior.can <= 0 ? warrior.respawnTimeLeft : '' }} </div>
                    <div class="warrior-hearts mt-2 flex">
                        <img src="/sprites/minecraft-kalp-dolu.svg" alt="heart"
                            :class="{ grayscale: warrior.can <= 0 }">
                        <img src="/sprites/minecraft-kalp-dolu.svg" alt="heart"
                            :class="{ grayscale: warrior.can <= 25 }">
                        <img src="/sprites/minecraft-kalp-dolu.svg" alt="heart"
                            :class="{ grayscale: warrior.can <= 50 }">
                        <img src="/sprites/minecraft-kalp-dolu.svg" alt="heart"
                            :class="{ grayscale: warrior.can <= 75 }">
                    </div>
                    <div class="warrior-stats-name pb-1">
                        {{ warrior.isim }}
                    </div>
            </div>

            <div class="tam-ekran-butonu">
                <div v-if="!tamEkrandir" class="cursor-pointer p-1" @click="$emit('tam-ekrani-ac')">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
                        fill="#e8eaed">
                        <path
                            d="M120-120v-200h80v120h120v80H120Zm520 0v-80h120v-120h80v200H640ZM120-640v-200h200v80H200v120h-80Zm640 0v-120H640v-80h200v200h-80Z" />
                    </svg>
                </div>

                <div v-else class="cursor-pointer p-1" @click="$emit('tam-ekrani-kapat')">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
                        fill="#e8eaed">
                        <path
                            d="m136-80-56-56 264-264H160v-80h320v320h-80v-184L136-80Zm344-400v-320h80v184l264-264 56 56-264 264h184v80H480Z" />
                    </svg>
                </div>
            </div>

        </div>

</template>
<script lang="ts" setup>
import { Warrior } from "@/js/kilicli-kavga/warrior";

const tuvalYuksekligi = 720;
const tuvalGenisligi = tuvalYuksekligi * 16 / 9;


const props = defineProps({
    tamEkrandir: Boolean,
    warriors: {
        type: Array as () => Warrior[],
        default() {
            return [];
        }
    },
    canvasClientWidth: Number,
})


function warriorStatStyle(warrior: Warrior) {
    const style = {
        position: 'absolute',
    } as any;
    const scale = props.canvasClientWidth / warrior.game.width;
    style.top = warrior.hitbox.pos.y * scale + 'px';
    style.left = (warrior.hitbox.pos.x + warrior.hitbox.w / 2) * scale + 'px';


    return style;

}
</script>
<style scoped>
* {
    --zaman-genisligi: 10%;
    --can-cubugu-yuksekligi: min(2.8vw, 2rem);
    --font-boyutu: var(--can-cubugu-yuksekligi);
    --can-cubugu-kenar-kalinligi: 3px;
    user-select: none;
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
    font-family: "Press Start 2P", system-ui;
    font-size: calc(var(--font-boyutu) / 1.5);
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

.ic-can-cubugu-1,
.ic-can-cubugu-2 {
    width: 100%;
    height: var(--can-cubugu-yuksekligi);
    background-color: rgba(255, 84, 84, 0.82);
    transition: width 0.2s ease-in-out;
}

.ic-can-cubugu-1 {}

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
    width: max-content;
}

.warrior-stats>* {
    margin-bottom: -0.25rem;
}

.warrior-hearts {}

.warrior-hearts img {
    width: 0.9rem;
    height: 0.9rem;
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
}

.grayscale {
    filter: grayscale(100%);
}
</style>
