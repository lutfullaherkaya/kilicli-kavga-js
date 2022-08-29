<template>
    <div class="canvas-container">
        <div id="fps" style="position: absolute; top: 1px; left: 1px; color: white; font-size: 0.5rem;"></div>
        <canvas></canvas>
        <div class="can-zaman-arayuzu">
            <div class="can-cubugu can-cubugu-1">
                <div id="ic-can-cubugu-1"></div>
                <span id="can-cubugu-isim-1" class="can-cubugu-isim">oyncu1</span>
            </div>
            <div class="zaman-kutusu">
                <span id="zaman">90</span>
            </div>
            <div class="can-cubugu can-cubugu-2">
                <div id="ic-can-cubugu-2"></div>
                <span id="can-cubugu-isim-2" class="can-cubugu-isim">oyncu2</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import main from '@/js/oyn.ts';

export default Vue.extend({
    name: 'KilicliKavgaOyunu',
    mounted() {
        main();
    }
});
</script>

<style scoped lang="scss">
* {
    --zaman-genisligi: 10%;
    --can-cubugu-yuksekligi: 15px;
    --can-cubugu-kenar-kalinligi: 2px;
}

canvas, img {
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
}

.canvas-container {
    position: relative;
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

#ic-can-cubugu-1, #ic-can-cubugu-2 {
    width: 100%;
    height: var(--can-cubugu-yuksekligi);
    background-color: rgba(255, 84, 84, 0.82);
    transition: width 0.2s ease-in-out;
}

#ic-can-cubugu-1 {

}

#ic-can-cubugu-2 {
    float: right;
}

.zaman-kutusu {
    padding: 5px;
    border-top: black solid var(--can-cubugu-kenar-kalinligi);
    border: black solid var(--can-cubugu-kenar-kalinligi);
    background-color: slategray;
    text-align: center;
}

.can-cubugu-isim {
    position: absolute;
    top: 50%;

    transform: translate(0, -50%);
}

#can-cubugu-isim-1 {
    left: calc(var(--can-cubugu-kenar-kalinligi) * 2);
}

#can-cubugu-isim-2 {
    right: calc(var(--can-cubugu-kenar-kalinligi) * 2);
}
</style>
