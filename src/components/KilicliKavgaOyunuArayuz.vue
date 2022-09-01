<template>
    <div>
        <kilicli-kavga-oyunu-arayuz-can-zaman :tam-ekrandir="tamEkrandir"
                                              :mobil-kontrolleri-goster="mobilKontrolleriGoster"
                                              @tam-ekrani-ac="$emit('tam-ekrani-ac')"
                                              @tam-ekrani-kapat="$emit('tam-ekrani-kapat')"
        />
        <kilicli-kavga-oyunu-arayuz-mobil v-if="mobilKontrolleriGoster"
                                          @mobil-kontroller-degisti="$emit('mobil-kontroller-degisti', $event)"
                                          :savasci-kontrolleri-mobil="savasciKontrolleriMobil"
        />
    </div>
</template>

<script lang="ts">
import KilicliKavgaOyunuArayuzCanZaman from '@/components/KilicliKavgaOyunuArayuzCanZaman.vue';
import KilicliKavgaOyunuArayuzMobil from '@/components/KilicliKavgaOyunuArayuzMobil.vue';
import { SavasciKontrolleri } from '@/js/oyn';
import Vue from "vue";

export default Vue.extend({
    name: "KilicliKavgaOyunuArayuz",
    components: { KilicliKavgaOyunuArayuzCanZaman, KilicliKavgaOyunuArayuzMobil },
    props: {
        tamEkrandir: Boolean,
        mobilKontrolleriGoster: Boolean,
    },
    data() {
        return {}
    },
})
</script>

<style scoped>


</style>
