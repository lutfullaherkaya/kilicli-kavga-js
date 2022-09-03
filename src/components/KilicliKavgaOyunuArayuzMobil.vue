<template>
    <div class="arayuz-mobil-komponenti" ref="arayuz-mobil-komponenti">
        <div ref="joystick-menzili" class="joystick-menzili"></div>
        <v-responsive class="sag-buton sag-saldiri-butonu" :aspect-ratio="1/1" @mousedown="saldirt"
                      @touchstart="saldirt">
            <div class="sag-buton-arkaplan" :style="{'background-color': butonRengi}">
            </div>
            <img src="/ikonlar/kilic.svg" class="sag-button-sembolu-kilic"
                 style="filter: invert(100%); width: 80%; transform: rotate(-45deg);">


        </v-responsive>
        <v-responsive class="sag-buton sag-takla-at-butonu" :aspect-ratio="1/1" @mousedown="taklaAttir"
                      @touchstart="taklaAttir">

            <div class="sag-buton-arkaplan" :style="{'background-color': butonRengi}">
            </div>
            <img src="/ikonlar/jump-icon.svg" class="sag-button-sembolu-takla"
                 style="filter: invert(100%); width: 55%; transform: rotate(120deg);">


        </v-responsive>

    </div>
</template>

<script lang="ts">
import nipplejs from 'nipplejs';
import Vue from "vue";
import {WarriorControls} from "@/js/kilicli-kavga/warrior";

export default Vue.extend({
    name: "KilicliKavgaOyunuArayuzMobil",
    props: {},
    data() {
        return {
            butonRengi: "white",
            joystick: null as any,
            joystickAyarlari: {
                size: 200,
                position: {
                    left: '32.5%',
                    bottom: '24.5%',
                },
                mode: 'semi',
                catchDistance: 100,
            } as any,
            joystickZiplamaYerinde: false,
            joystickGenislikYuzdesi: 12.5,
            joystickMenzilYuzdesi: 15,
        }
    },
    methods: {
        taklaAttir(event: any) {
            event.stopPropagation();
            const yeniKontroller = {
                taklaAt: true,
            };
            // sadece degisen kontrol anahtarları emitlenir.
            this.$emit('mobil-kontroller-degisti', yeniKontroller);
        },
        saldirt(event: any) {
            event.stopPropagation();
            const yeniKontroller = {
                saldiri: true,
            };
            // sadece degisen kontrol anahtarları emitlenir.
            this.$emit('mobil-kontroller-degisti', yeniKontroller);
        },
        joystickOlustur() {
            this.joystickAyarlari.zone = this.$refs['joystick-menzili'];
            this.joystickAyarlari.color = this.butonRengi;
            this.joystick = nipplejs.create(this.joystickAyarlari);
            this.joystick.on('dir:left', () => {
                const yeniKontroller = {
                    solKosu: true,
                    sagKosu: false,
                    sonKosulanYonSagdir: false,
                };
                this.$emit('mobil-kontroller-degisti', yeniKontroller);
            });
            this.joystick.on('dir:right', () => {
                const yeniKontroller = {
                    solKosu: false,
                    sagKosu: true,
                    sonKosulanYonSagdir: true,
                };
                this.$emit('mobil-kontroller-degisti', yeniKontroller);
            });
            this.joystick.on('dir:up dir:down', () => {
                const yeniKontroller = {
                    solKosu: false,
                    sagKosu: false,
                };
                this.$emit('mobil-kontroller-degisti', yeniKontroller);
            });

            this.joystick.on('move', (evt: nipplejs.JoystickEventTypes, data: nipplejs.JoystickOutputData) => {
                if (data.angle.degree > 30 && data.angle.degree < 150) {
                    if (!this.joystickZiplamaYerinde) {
                        const yeniKontroller = {
                            zipla: true,
                        };
                        this.$emit('mobil-kontroller-degisti', yeniKontroller);
                        this.joystickZiplamaYerinde = true;
                    }
                } else {
                    if (this.joystickZiplamaYerinde) {
                        this.joystickZiplamaYerinde = false;
                    }
                }
            })

            this.joystick.on('end', () => {
                const yeniKontroller = {
                    solKosu: false,
                    sagKosu: false,
                };
                // sadece degisen kontrol anahtarları emitlenir.
                this.$emit('mobil-kontroller-degisti', yeniKontroller);
                this.joystickZiplamaYerinde = false;
            });
        },
        joystickBoyutYenile() {
            const cWidth = (this.$refs['arayuz-mobil-komponenti'] as HTMLDivElement)!.clientWidth;
            const yeniBoyut = Math.round(cWidth * this.joystickGenislikYuzdesi / 100);
            const yeniMenzil = Math.round(cWidth * this.joystickMenzilYuzdesi / 100);

            if (this.joystickAyarlari.size !== yeniBoyut) {
                this.joystickAyarlari.size = yeniBoyut;
                this.joystickAyarlari.catchDistance = yeniMenzil;
                if (this.joystick) {
                    this.joystick.destroy();
                }
                this.joystickOlustur();
            }

        },
    },

    mounted() {
        this.joystickBoyutYenile();
        window.addEventListener('resize', this.joystickBoyutYenile);
    },
    destroyed() {
        window.removeEventListener('resize', this.joystickBoyutYenile);
        this.joystick.destroy();
    },
})
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
    width: 60%;
    height: 100%;
}

.sag-buton {
    position: absolute;

}

.sag-button-sembolu-takla {
    position: absolute;
    top: 22%;
    left: 22%;
    transform: translate(-50%, 50%);
}

.sag-button-sembolu-kilic {
    position: absolute;
    top: 25%;
    left: 11%;
    transform: translate(-50%, 50%);
}

.sag-buton-arkaplan {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
    border-radius: 100%;
    z-index: 1;
    opacity: 0.25;

}

.sag-saldiri-butonu {
    bottom: 20%;
    right: 5%;
    width: 8.5%;
}

.sag-takla-at-butonu {
    bottom: 10%;
    right: 15%;
    width: 8.5%;
}


</style>
