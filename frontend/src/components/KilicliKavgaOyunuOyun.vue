<template>
    <div class="canvas-container" ref="canvasContainer" style="width: 100%; height: 100%;">
        <div id="fps" style="position: absolute; top: 1px; left: 1px; color: white; font-size: 1rem; z-index: 111;">
        </div>
        <div class="genislik-sinirlayici" :style="{ width: genislikSinirlayiciGenisligi }">
            <!-- bunun amaci tam ekran oldugunda kenarlara siyah cubuk koyabilmek -->
            <v-responsive :aspect-ratio="16 / 9">
                <canvas ref="gameCanvas" style="width: 100%; height: 100%;"></canvas>

                <kilicli-kavga-oyunu-arayuz-can-zaman :tam-ekrandir="tamEkrandir"
                    :mobil-kontrolleri-goster="mobilKontrolleriGoster" @tam-ekrani-ac="tamEkraniAc"
                    @tam-ekrani-kapat="tamEkraniKapat" :warriors="game?.warriors"
                    :canvas-client-width="canvasClientWidth" />
                <!--                <div style="width: 40px; height: 30px; position: absolute; left: 0; top: 0; background-color: red;"
                                     id="kutu">
                                </div>-->
            </v-responsive>
        </div>
        <kilicli-kavga-oyunu-arayuz-mobil v-if="mobilKontrolleriGoster" style="z-index: 1111;"
            @mobil-kontroller-degisti="mobilKontrollerDegisince" />


    </div>
</template>
<script lang="ts" setup>
import KilicliKavgaOyunuArayuzCanZaman from '@/components/KilicliKavgaOyunuArayuzCanZaman.vue'
import KilicliKavgaOyunuArayuzMobil from '@/components/KilicliKavgaOyunuArayuzMobil.vue'
import { onMounted, onUnmounted } from "vue";
import { Game } from "@/js/kilicli-kavga/game";
import { Sprite } from "@/js/kilicli-kavga/sprite";
import { WarriorCollision } from "@/js/kilicli-kavga/warriorCollision";
import { SavasciKontrolYoneticisi } from "@/js/kilicli-kavga/kontrolYoneticileri/savasciKontrolYoneticisi";
import { KlavyeSavasciKontrolYoneticisi } from "@/js/kilicli-kavga/kontrolYoneticileri/klavyeSavasciKontrolYoneticisi";
import { MobilSavasciKontrolYoneticisi } from "@/js/kilicli-kavga/kontrolYoneticileri/mobilSavasciKontrolYoneticisi";
import { UzaktanSavasciKontrolYoneticisi } from "@/js/kilicli-kavga/kontrolYoneticileri/uzaktanSavasciKontrolYoneticisi";
import { Warrior, WarriorControls, SpriteBilgileri } from "@/js/kilicli-kavga/warrior";
import { YayinciSavasciKontrolYoneticisi } from "@/js/kilicli-kavga/kontrolYoneticileri/yayinciSavasciKontrolYoneticisi";
import { TwoDVector } from "@/js/kilicli-kavga/utility/twoDVector";
import { SpriteWithSound } from "@/js/kilicli-kavga/spriteWithSound";

type SavasciAdi = string;

const tuvalYuksekligi = 720;
const tuvalGenisligi = tuvalYuksekligi * 16 / 9;


const props = defineProps({
    dokunmalidir: Boolean,
    mobilKontrolleriGoster: Boolean,
    socket: Object,
    oyuncular: Array as () => Array<{ isim: SavasciAdi }>,
    buOyuncuIsmi: String,
})

const gameCanvas = ref(null as null | HTMLCanvasElement)
const canvasContainer = ref(null as null | HTMLDivElement)

const tamEkrandir = ref(false)
const ekranGenisligi = ref(100)
const ekranYuksekligi = ref(100)
const darkSoulsaBenzeyenElemanSpriteleri = ref(null)
const game = ref(null as null | Game)
const mobilKontrolYoneticisi = new MobilSavasciKontrolYoneticisi(props.socket)
const buSavasci = ref(null as null | Warrior)
const canvasClientWidth = ref(1000)


const genislikSinirlayiciGenisligi = computed(() => {
    if (tamEkrandir.value && ekranGenisligi.value / ekranYuksekligi.value >= 16 / 9) {
        return ekranYuksekligi.value * 16 / 9 + 'px';
    } else {
        return '100%';
    }
});


function refreshCanvasClientWidth() {
    canvasClientWidth.value = (gameCanvas.value as HTMLDivElement).clientWidth;
}
function ekranBoyutuGuncelle(): void {
    ekranGenisligi.value = window.innerWidth;
    ekranYuksekligi.value = window.innerHeight;
}
function tamEkranGuncelle(): void {
    tamEkrandir.value = Boolean(document.fullscreenElement);
}
function tamEkraniAc(): void {
    const elem = canvasContainer.value as HTMLElement & {
        mozRequestFullScreen(): Promise<void>;
        webkitRequestFullscreen(): Promise<void>;
        msRequestFullscreen(): Promise<void>;
    };
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
}
function tamEkraniKapat(): void {
    const docWithBrowsersExitFunctions = document as Document & {
        mozCancelFullScreen(): Promise<void>;
        webkitExitFullscreen(): Promise<void>;
        msExitFullscreen(): Promise<void>;
    };
    if (docWithBrowsersExitFunctions.exitFullscreen) {
        docWithBrowsersExitFunctions.exitFullscreen();
    } else if (docWithBrowsersExitFunctions.webkitExitFullscreen) { /* Safari */
        docWithBrowsersExitFunctions.webkitExitFullscreen();
    } else if (docWithBrowsersExitFunctions.msExitFullscreen) { /* IE11 */
        docWithBrowsersExitFunctions.msExitFullscreen();
    }
}
function mobilKontrollerDegisince(baziKontroller: Partial<WarriorControls>): void {
    mobilKontrolYoneticisi.kontrolGuncelle(baziKontroller);
}
function savasciEkle(tuval: Game, isim: SavasciAdi, spriteler: SpriteBilgileri, kontrolYoneticisi: SavasciKontrolYoneticisi | null = null): void {
    let position = new TwoDVector(150, tuval.height - 111);
    let sagaBakiyor;
    if (tuval.warriors.length == 0) {
        position = new TwoDVector(150, tuval.height - 111);
        sagaBakiyor = true;
    } else if (tuval.warriors.length == 1) {
        position = new TwoDVector(tuval.width - 200, tuval.height - 111);
        sagaBakiyor = false;
    } else { // üçüncüden sonraki savaşçılar orta yukarıdan düşer.
        position = new TwoDVector(1920 / 2 + 25, -100);
        sagaBakiyor = false;
    }
    const yeniSavasci = new Warrior(isim,
        tuval,
        spriteler,
        position,
        undefined,
        undefined,
        true,
        tuval.groundLevelY,
        50,
        100,
        sagaBakiyor,
        kontrolYoneticisi,
    )

    tuval.warriors.push(yeniSavasci);
    tuval.entities.push(yeniSavasci);

    if (props.buOyuncuIsmi != "" && isim == props.buOyuncuIsmi) {
        buSavasci.value = yeniSavasci;
        mobilKontrolYoneticisi.yonetmeyeBasla(yeniSavasci);
    }
}
function main() {
    game.value = new Game(document.querySelector('canvas'), tuvalGenisligi, tuvalYuksekligi, Math.round((tuvalYuksekligi / 600) * 490));


    const arkaplan = new Sprite(game.value, {
        resimKaynagi: './sprites/NightForest/Image without mist.png',
        skala: 1.72 * tuvalYuksekligi / 600,
    });


    darkSoulsaBenzeyenElemanSpriteleri.value = {
        sol: {
            rolanti: new Sprite(game.value, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_left/_Idle.png',
                resimSayisi: 10,
                pozisyonOffset: new TwoDVector(-150, -115),
                skala: 2.7,
                isim: 'rolanti',
                yonuSagdir: false,

            }),
            kosu: new SpriteWithSound(game.value, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_left/_Run.png',
                resimSayisi: 10,
                pozisyonOffset: new TwoDVector(-150, -115),
                skala: 2.7,
                isim: 'kosu',
                yonuSagdir: false,
                soundSrc: 'sounds/half-life-walking.mp3',
                soundLoops: true,
            }),
            donme: new Sprite(game.value, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_left/_TurnAround.png',
                resimSayisi: 3,
                pozisyonOffset: new TwoDVector(-150, -115),
                skala: 2.7,
                isim: 'donme',
                yonuSagdir: false,
            }),
            taklaAt: new SpriteWithSound(game.value, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_left/_Roll.png',
                resimSayisi: 12,
                pozisyonOffset: new TwoDVector(-130, -115),
                skala: 2.7,
                isim: 'taklaAt',
                yonuSagdir: false,
                sonsuzAnimasyon: false,
                soundSrc: 'sounds/dark-souls-3-takla.mp3',
                kacSahnedeResimDegisir: 6,
            }),
            zipla: new Sprite(game.value, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_left/_Jump.png',
                resimSayisi: 3,
                pozisyonOffset: new TwoDVector(-150, -115),
                skala: 2.7,
                isim: 'zipla',
                yonuSagdir: false,
            }),
            dusus: new Sprite(game.value, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_left/_Fall.png',
                resimSayisi: 3,
                pozisyonOffset: new TwoDVector(-150, -115),
                skala: 2.7,
                isim: 'dusus',
                yonuSagdir: false,
            }),
            saldiri1: new SpriteWithSound(game.value, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_left/_AttackNoMovement.png',
                resimSayisi: 4,
                pozisyonOffset: new TwoDVector(-150, -115),
                skala: 2.7,
                isim: 'saldiri1',
                kacSahnedeResimDegisir: 7,
                yonuSagdir: false,
                sonsuzAnimasyon: false,
                soundSrc: 'sounds/sword-quick.mp3',
            }),
            saldiri2: new SpriteWithSound(game.value, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_left/_Attack2NoMovement.png',
                resimSayisi: 6,
                pozisyonOffset: new TwoDVector(-150, -115),
                skala: 2.7,
                isim: 'saldiri2',
                kacSahnedeResimDegisir: 7,
                yonuSagdir: false,
                sonsuzAnimasyon: false,
                soundSrc: 'sounds/sword-side.mp3',
            }),
            oldu: new SpriteWithSound(game.value, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_left/_Death.png',
                resimSayisi: 10,
                pozisyonOffset: new TwoDVector(-150, -115),
                skala: 2.7,
                isim: 'oldu',
                yonuSagdir: false,
                sonsuzAnimasyon: false,
                sonundaSonSahneyiTut: true,
                soundSrc: 'sounds/gta-wasted.mp3'
            }),

        },
        sag: {
            rolanti: new Sprite(game.value, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_right/_Idle.png',
                resimSayisi: 10,
                pozisyonOffset: new TwoDVector(-122, -115),
                skala: 2.7,
                isim: 'rolanti',
                yonuSagdir: true,
            }),
            kosu: new SpriteWithSound(game.value, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_right/_Run.png',
                resimSayisi: 10,
                pozisyonOffset: new TwoDVector(-126, -115),
                skala: 2.7,
                isim: 'kosu',
                yonuSagdir: true,
                soundSrc: 'sounds/half-life-walking.mp3',
                soundLoops: true,

            }),
            donme: new Sprite(game.value, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_right/_TurnAround.png',
                resimSayisi: 3,
                pozisyonOffset: new TwoDVector(-126, -115),
                skala: 2.7,
                isim: 'donme',
                yonuSagdir: true,

            }),
            taklaAt: new SpriteWithSound(game.value, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_right/_Roll.png',
                resimSayisi: 12,
                pozisyonOffset: new TwoDVector(-122, -115),
                skala: 2.7,
                kacSahnedeResimDegisir: 6,
                isim: 'taklaAt',
                yonuSagdir: true,
                sonsuzAnimasyon: false,
                soundSrc: 'sounds/dark-souls-3-takla.mp3',
            }),
            zipla: new Sprite(game.value, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_right/_Jump.png',
                resimSayisi: 3,
                pozisyonOffset: new TwoDVector(-122, -115),
                skala: 2.7,
                isim: 'zipla',
                yonuSagdir: true,
            }),
            dusus: new Sprite(game.value, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_right/_Fall.png',
                resimSayisi: 3,
                pozisyonOffset: new TwoDVector(-122, -115),
                skala: 2.7,
                isim: 'dusus',
                yonuSagdir: true,
            }),
            saldiri1: new SpriteWithSound(game.value, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_right/_AttackNoMovement.png',
                resimSayisi: 4,
                pozisyonOffset: new TwoDVector(-122, -115),
                skala: 2.7,
                isim: 'saldiri1',
                kacSahnedeResimDegisir: 7,
                yonuSagdir: true,
                sonsuzAnimasyon: false,
                soundSrc: 'sounds/sword-quick.mp3',
            }),
            saldiri2: new SpriteWithSound(game.value, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_right/_Attack2NoMovement.png',
                resimSayisi: 6,
                pozisyonOffset: new TwoDVector(-122, -115),
                skala: 2.7,
                isim: 'saldiri2',
                kacSahnedeResimDegisir: 7,
                yonuSagdir: true,
                sonsuzAnimasyon: false,
                soundSrc: 'sounds/sword-side.mp3',
            }),
            oldu: new SpriteWithSound(game.value, {
                resimKaynagi: './sprites/FreeKnight_v1/Colour1/NoOutline/120x80_PNGSheets_right/_Death.png',
                resimSayisi: 10,
                pozisyonOffset: new TwoDVector(-122, -115),
                skala: 2.7,
                isim: 'oldu',
                yonuSagdir: true,
                sonsuzAnimasyon: false,
                sonundaSonSahneyiTut: true,
                soundSrc: 'sounds/gta-wasted.mp3'
            }),
        },
    };
    setInterval(() => {
        game.value!.setTimeLeftInUI();
    }, 1000);


    // https://stackoverflow.com/questions/4787431/check-fps-in-js
    // The higher this value, the less the fps will reflect temporary variations
    // A value of 1 will only keep the last value
    // 16.7ms yani 60 fps'den baslatiyoruz hesaplamaya.

    const filterStrength = 5;
    let avgFrameTime = 16.7, lastTimeStamp = performance.now();

    const canlandir = (timestamp: number) => {
        window.requestAnimationFrame(canlandir);
        const thisFrameTimeInMs = timestamp - lastTimeStamp;
        avgFrameTime += (thisFrameTimeInMs - avgFrameTime) / filterStrength;
        lastTimeStamp = timestamp;

        game.value!.thisFrameTimeInMs = thisFrameTimeInMs;
        game.value!.fps = 1000 / avgFrameTime;
        game.value!.cleanCanvas();
        arkaplan.start().update();
        for (const warrior of game.value!.warriors) {
            warrior.update();
        }

        //WarriorCollision.engelle(game.value!.warriors);

    }
    const fpsOut = document.getElementById('fps');

    setInterval(function () {
        fpsOut!.innerHTML = (1000 / avgFrameTime).toFixed(1) + " fps";
    }, 1000);

    window.requestAnimationFrame(canlandir);
}

function oyuncularDegisince() {
    if (game.value && props.oyuncular) {
        for (const oyuncu of props.oyuncular) {
            let savasciIsimleri = game.value.warriors.map((savasci) => savasci.isim);
            if (!savasciIsimleri.includes(oyuncu.isim)) {
                if (props.buOyuncuIsmi != "" && oyuncu.isim == props.buOyuncuIsmi) {
                    let kontrolYoneticisi: SavasciKontrolYoneticisi | null = null;
                    kontrolYoneticisi = new KlavyeSavasciKontrolYoneticisi(props.socket, true, true, canvasContainer.value as HTMLElement)
                    savasciEkle(game.value!, oyuncu.isim, darkSoulsaBenzeyenElemanSpriteleri.value, kontrolYoneticisi);
                    // always using mouse and keybaord, sometimes using mobile
                } else {
                    savasciEkle(game.value!, oyuncu.isim, darkSoulsaBenzeyenElemanSpriteleri.value, new UzaktanSavasciKontrolYoneticisi(props.socket));
                }
            }
        }
        const oyuncuIsimleri = props.oyuncular.map((oyuncu) => oyuncu.isim);
        game.value.warriors = game.value.warriors.filter((savasci) => {
            if (!oyuncuIsimleri.includes(savasci.isim)) {
                savasci.kontrolYoneticisi?.yonetmeyiBirak();
                return false;
            }
            return true;
        });
        (buSavasci.value?.kontrolYoneticisi as YayinciSavasciKontrolYoneticisi).sendWarriorInformation();
    }
}


const mounted = ref(false);
onMounted(() => {
    mounted.value = true;

    window.addEventListener('resize', ekranBoyutuGuncelle);
    window.addEventListener('fullscreenchange', tamEkranGuncelle);
    window.addEventListener('mozfullscreenchange', tamEkranGuncelle);
    window.addEventListener('webkitfullscreenchange', tamEkranGuncelle);
    window.addEventListener('msfullscreenchange', tamEkranGuncelle);
    window.addEventListener('resize', refreshCanvasClientWidth); // in case ResizeObserver is not supported
    refreshCanvasClientWidth();
    new ResizeObserver(() => refreshCanvasClientWidth)
        .observe(gameCanvas.value as HTMLDivElement);

    main();
    watch(props.oyuncular, () => {
        oyuncularDegisince();
    }, { immediate: true });
})
onUnmounted(() => {
    window.removeEventListener('resize', ekranBoyutuGuncelle);
    window.removeEventListener('fullscreenchange', tamEkranGuncelle);
    window.removeEventListener('mozfullscreenchange', tamEkranGuncelle);
    window.removeEventListener('webkitfullscreenchange', tamEkranGuncelle);
    window.removeEventListener('msfullscreenchange', tamEkranGuncelle);
    window.removeEventListener('resize', refreshCanvasClientWidth);

})


</script>
<style scoped lang="scss">
canvas,
img {
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
}

.canvas-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

}

.genislik-sinirlayici {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
