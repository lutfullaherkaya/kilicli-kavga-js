<template>
    <div class="home">
        <kilicli-kavga-oyunu/>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import KilicliKavgaOyunu from '@/components/KilicliKavgaOyunu.vue'; // @ is an alias to /src

export default Vue.extend({
    name: 'HomeView',
    components: {
        KilicliKavgaOyunu,
    },
    data() {
        return {
            sheet: false
        }
    }
});
</script>

<style scoped>
.home {
    width: 100%;
    display: flex;
    justify-content: center;
}
</style>
