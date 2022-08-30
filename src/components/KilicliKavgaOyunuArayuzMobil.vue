<template>
    <div class="arayuz-mobil-komponenti" ref="arayuz-mobil-komponenti">
        <div ref="joystick-menzili" class="joystick-menzili"></div>
    </div>
</template>

<script>
import { SavasciKontrolleri } from '@/js/oyn';
import nipplejs from 'nipplejs';

export default {
    name: "KilicliKavgaOyunuArayuzMobil",
    props: {
        savasciKontrolleriMobil: SavasciKontrolleri,
    },
    data() {
        return {
            joystick: null,
        }
    },
    mounted() {
        const joystickAyarlari = {
            zone: this.$refs['joystick-menzili'],
            mode: 'static',
            catchDistance: 150,
            position: {
                left: '20%',
                bottom: '18%',
            },
        };
        this.joystick = nipplejs.create(joystickAyarlari);
        this.joystick.on('dir:left', (evt, data) => {
            const yeniKontroller = {
                solKosu: true,
                sagKosu: false,
                sonKosulanYonSagdir: false,
            };
            this.$emit('kontroller-degisti', yeniKontroller);
        });
        this.joystick.on('dir:right', (evt, data) => {
            const yeniKontroller = {
                solKosu: false,
                sagKosu: true,
                sonKosulanYonSagdir: true,
            };
            this.$emit('kontroller-degisti', yeniKontroller);
        });
        this.joystick.on('dir:up dir:down', (evt, data) => {
            const yeniKontroller = {
                solKosu: false,
                sagKosu: false,
            };
            this.$emit('kontroller-degisti', yeniKontroller);
        });

        this.joystick.on('move', (evt, data) => {
            if (data.angle.degree > 30 && data.angle.degree < 150) {
                if (!this.savasciKontrolleriMobil.zipla) {
                    const yeniKontroller = {
                        zipla: true,
                    };
                    this.$emit('kontroller-degisti', yeniKontroller);
                }
            }
            else {
                if (this.savasciKontrolleriMobil.zipla) {
                    const yeniKontroller = {
                        zipla: false,
                    };
                    this.$emit('kontroller-degisti', yeniKontroller);
                }
            }
        })

        this.joystick.on('end', (evt, data) => {
            const yeniKontroller = {
                solKosu: false,
                sagKosu: false,
                zipla: false,
            };
            // sadece degisen kontrol anahtarları emitlenir.
            this.$emit('kontroller-degisti', yeniKontroller);
        });
    },
    destroyed() {
        this.joystick.destroy();
    },
}
</script>

<style scoped>
.arayuz-mobil-komponenti {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}
.arayuz-mobil-komponenti * {
    pointer-events: auto;
}

.joystick-menzili {
    position: absolute;
    top: 0;
    left: 0;
    width: 50%;
    height: 100%;
}

</style>
