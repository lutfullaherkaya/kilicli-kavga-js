<template>
    <div>

    </div>
</template>

<script lang="ts">
import KilicliKavgaOyunuArayuzCanZaman from '@/components/KilicliKavgaOyunuArayuzCanZaman.vue';
import KilicliKavgaOyunuArayuzMobil from '@/components/KilicliKavgaOyunuArayuzMobil.vue';
import Vue from "vue";
import {SavasciKontrolleri} from "@/js/kilicli-kavga/interfaces";

export default Vue.extend({
    name: "KilicliKavgaOyunuArayuz",
    components: { KilicliKavgaOyunuArayuzCanZaman, KilicliKavgaOyunuArayuzMobil },
    props: {
        tamEkrandir: Boolean,
        mobilKontrolleriGoster: Boolean,
        savascilar: Array
    },
    data() {
        return {}
    },
})
</script>

<style scoped>


</style>
