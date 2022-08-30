<template>
    <div class="arayuz-mobil-komponenti" ref="arayuz-mobil-komponenti">

    </div>
</template>

<script>
import { SavasciKontrolleri } from '@/js/oyn';
import nipplejs from 'nipplejs';

export default {
    name: "KilicliKavgaOyunuArayuzMobil",
    props: {
        savasciKontrolleriMobil: SavasciKontrolleri
    },
    data() {
        return {
            joystickAyarlari: {},
            joystickYoneticisi: null,
        }
    },
    mounted() {
        this.joystickAyarlari = {
            zone: this.$refs['arayuz-mobil-komponenti'],                  // active zone
            mode: 'semi',
            catchDistance: 150,
        };
        this.joystickYoneticisi = nipplejs.create(this.joystickAyarlari);
    },
    destroyed() {
        this.joystickYoneticisi.destroy();
    }
}
</script>

<style scoped>
.arayuz-mobil-komponenti {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
</style>
