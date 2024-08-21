<template>
    <div class="arayuz-mobil-komponenti" ref="arayuzMobilKomponenti">
        <div ref="joystickMenzili" class="joystick-menzili"></div>
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

<script lang="ts" setup>
import nipplejs from 'nipplejs';

import { onMounted, onUnmounted } from 'vue';

const emit = defineEmits(['mobil-kontroller-degisti'])
const joystickMenzili = ref(null)
const arayuzMobilKomponenti = ref(null);

            const butonRengi =  ref("white")
            const joystick = ref(null)
            const joystickAyarlari = ref({
                size: 200,
                position: {
                    left: '32.5%',
                    bottom: '24.5%',
                },
                mode: 'semi',
                catchDistance: 100,
            });
            const joystickZiplamaYerinde = ref(false)
            const joystickGenislikYuzdesi = ref(12.5)
            const joystickMenzilYuzdesi = ref(14)

        function taklaAttir(event: any) {
            event.stopPropagation();
            const yeniKontroller = {
                taklaAt: true,
            };
            // sadece degisen kontrol anahtarları emitlenir.
            emit('mobil-kontroller-degisti', yeniKontroller);
        }
        function saldirt(event: any) {
            event.stopPropagation();
            const yeniKontroller = {
                saldiri: true,
            };
            // sadece degisen kontrol anahtarları emitlenir.
            emit('mobil-kontroller-degisti', yeniKontroller);
        }
        function joystickOlustur() {
            joystickAyarlari.value.zone = joystickMenzili.value;
            joystickAyarlari.value.color = butonRengi.value;
            joystick.value = nipplejs.create(joystickAyarlari.value);
            joystick.value.on('dir:left', () => {
                const yeniKontroller = {
                    solKosu: true,
                    sagKosu: false,
                    sonKosulanYonSagdir: false,
                };
                emit('mobil-kontroller-degisti', yeniKontroller);
            });
            joystick.value.on('dir:right', () => {
                const yeniKontroller = {
                    solKosu: false,
                    sagKosu: true,
                    sonKosulanYonSagdir: true,
                };
                emit('mobil-kontroller-degisti', yeniKontroller);
            });
            joystick.value.on('dir:up dir:down', () => {
                const yeniKontroller = {
                    solKosu: false,
                    sagKosu: false,
                };
                emit('mobil-kontroller-degisti', yeniKontroller);
            });

            joystick.value.on('move', (evt: nipplejs.JoystickEventTypes, data: nipplejs.JoystickOutputData) => {
                if (data.angle.degree > 30 && data.angle.degree < 150) {
                    if (!joystickZiplamaYerinde.value) {
                        const yeniKontroller = {
                            zipla: true,
                        };
                        emit('mobil-kontroller-degisti', yeniKontroller);
                        joystickZiplamaYerinde.value = true;
                    }
                } else {
                    if (joystickZiplamaYerinde.value) {
                        joystickZiplamaYerinde.value = false;
                    }
                }
            })

            joystick.value.on('end', () => {
                const yeniKontroller = {
                    solKosu: false,
                    sagKosu: false,
                };
                // sadece degisen kontrol anahtarları emitlenir.
                emit('mobil-kontroller-degisti', yeniKontroller);
                joystickZiplamaYerinde.value = false;
            });
        }
        function joystickBoyutYenile() {
            const cWidth = (arayuzMobilKomponenti.value as HTMLDivElement)!.clientWidth;
            const yeniBoyut = Math.round(cWidth * joystickGenislikYuzdesi.value / 100);
            const yeniMenzil = Math.round(cWidth * joystickMenzilYuzdesi.value / 100);

            if (joystickAyarlari.value.size !== yeniBoyut) {
                joystickAyarlari.value.size = yeniBoyut;
                joystickAyarlari.value.catchDistance = yeniMenzil;
                if (joystick.value) {
                    joystick.value.destroy();
                }
                joystickOlustur();
            }

        }
onMounted(() => {
    joystickBoyutYenile();
    window.addEventListener('resize', joystickBoyutYenile);
})

onUnmounted(() => {
    window.removeEventListener('resize', joystickBoyutYenile);
    joystick.value.destroy();
})

</script>

<style scoped>
* {
    user-select: none;
}
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
