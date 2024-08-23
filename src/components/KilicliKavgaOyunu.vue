<template>
    <div class="container mx-auto p-4" v-if="!oyuncuIsmiSecildi">
        <div class="flex flex-col items-center sm:mt-5">
            <img src="../assets/logo/kiliclikavga.svg" alt="Lerkaya Games logosu" width="422" height="157"
                style="height: auto;" class="w-full max-w-md">
            <div class="w-full max-w-md">
                <img src="../assets/logo/lerkayagames.svg" alt="Lerkaya Games logosu" width="986" height="104"
                    style="height: auto;" class="w-full mt-1 max-w-[180px] float-right mr-3">
            </div>

        </div>

        <div class="text-center mt-6 golgeli oyun-fontu text-white ana-sayfa-yazi">
            Lerkaya Games ailesine hoş geldiniz! Oyunumuza katılmak için hemen bir isim seçin:
        </div>


        <form class="mb-2 flex flex-col items-center" @submit.prevent="oyuncuOlustur">
            <div class="mt-4 justify-center">


                <InputText class="text-center oyun-fontu text-2xl" placeholder="Oyuncu adı..." id="playername"
                    v-model="yeniOyuncuAdi" />

                <Message class="mt-2" v-if="yeniOyuncuAdiZatenVar" severity="error">Bu kullanıcı zaten var.
                </Message>
                <Message class="mt-2" v-if="yeniOyuncuAdi.length > 20" severity="error">En fazla 20 karakter
                    olabilir.</Message>
            </div>

            <Button label="Oyuna Katıl" :disabled="!girdiFormuUygun" class="mt-3 oyun-fontu text-2xl" type="submit" />

            <div v-if="!mobilMi()" class="text-white oyun-fontu ana-sayfa-yazi !text-2xl mt-3">

                <div class="flex align-center items-center">
                    <img src="../assets/tuslar/wasd.svg" alt="w, a, s, d tuşları"
                        class="h-auto w-[4.5rem] md:w-[6.5rem]" width="41" height="25">
                    <span class="ml-2">Hareket et ve zıpla</span>
                </div>
                <div class="flex align-center items-center mt-3">
                    <img src="../assets/tuslar/shift.svg" alt="shift tuşu" class="h-auto w-[3rem] md:w-[4.5rem]"
                        width="28" height="12">
                    <span class="ml-2">Takla at</span>
                </div>
                <div class="flex align-center items-center mt-3">
                    <img src="../assets/tuslar/space.svg" alt="space tuşu" class="h-auto w-[3.25rem] md:w-[4.8rem]"
                        width="30" height="12">
                    /
                    <img src="../assets/tuslar/soltik.svg" alt="fare sol tık" class="h-auto w-[1.25rem] md:w-[1.5rem]"
                        width="18" height="24">
                    <span class="ml-2">Saldır</span>
                </div>
            </div>


        </form>
        <div class="text-center mt-6 golgeli oyun-fontu text-white ana-sayfa-yazi">
            <template v-if="oyuncular?.length">
                Çevrim içi oyuncular:
                <div v-for="oyuncu in oyuncular">
                    <span>{{ oyuncu.isim }}</span>
                </div>
            </template>
            <template v-else>
                Henüz oynayan kimse yok.
            </template>

        </div>


        <p class="text-center ana-sayfa-yazi oyun-fontu text-white mt-12">
            Yapımcı: Lütfullah Erkaya
        </p>




    </div>
    <Dialog v-else v-model:visible="visible" modal class="w-full h-full bg-transparent border-0 " blockScroll :closeOnEscape="false" :closable="false">
        <template #container="{ closeCallback }">
            <KilicliKavgaOyunuOyun ref="oyun" style="background:none;" :mobil-kontrolleri-goster="mobilKontrolleriGoster"
                :dokunmalidir="dokunmalidir" :socket="socket" :oyuncular="oyuncular" :bu-oyuncu-ismi="yeniOyuncuAdi" />
        </template>
    </Dialog>


</template>

<script lang="ts" setup>
import { io } from "socket.io-client";
import axios from "axios";
import KilicliKavgaOyunuOyun from "@/components/KilicliKavgaOyunuOyun.vue";
import ToggleSwitch from 'primevue/toggleswitch';

const oyun = ref(null)
const oyuncular = ref([]);
const dokunmalidir = ref(false)
const socket = io()
const rakipIsmi = ref('')
const yeniOyuncuAdi = ref('')
const oyuncuIsmiSecildi = ref(false)

function mobilMi(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

const girdiFormuUygun = computed(() => {
    return !yeniOyuncuAdiZatenVar.value && uzunlukUygun.value;
})

const yeniOyuncuAdiZatenVar = computed(() => {
    for (let oyuncu of oyuncular.value) {
        if (oyuncu.isim == yeniOyuncuAdi.value) {
            return true;
        }
    }
    return false;
})
const uzunlukUygun = computed(() => {
    return yeniOyuncuAdi.value.length > 0 && yeniOyuncuAdi.value.length <= 20;
})

const visible = ref(true)


function dokunmaliMi(): boolean {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0));
}

function oyuncuOlustur() {
    axios.post('/api/oyuncular', {
        isim: yeniOyuncuAdi.value,
    }).then(response => {
        // (this as any).$snotify.success(response.data.isim + ' oyuncusu oluşturuldu.'); // todo: snotify ekle
        oyuncuIsmiSecildi.value = true;
        socket.emit('oyuncuyu sockete bagla', {
            isim: response.data.isim,
        });

    }).catch(error => {
        // (this as any).$snotify.error(error.response.data.message); // todo: snotify
    });

}

onBeforeMount(() => {
    dokunmalidir.value = dokunmaliMi();

})
onMounted(() => {
    axios.get('/api/oyuncular').then(response => {
        oyuncular.value = Object.values(response.data);
    }).catch(error => {
        (this as any).$snotify.error(error.response.data.message);
    });
    socket.on('oyuncu guncel listesi', (msg) => {
        oyuncular.value = Object.values(msg);

    })
})





onUnmounted((() => {
    socket.disconnect();
}))






</script>

<style>
.ana-sayfa-yazi {
    text-shadow:
        1px 1px 0 #000,
        -1px 1px 0 #000,
        -1px -1px 0 #000,
        1px -1px 0 #000,
        0px 0px 10px rgba(0, 0, 0, 0.9),
        0px 0px 8px rgba(0, 0, 0, 0.9),
        0px 0px 6px rgba(0, 0, 0, 0.9),
        0px 0px 4px rgba(0, 0, 0, 0.9),
        0px 0px 2px rgba(0, 0, 0, 0.9);


    font-size: 1.875rem;

    @media screen and (min-width: 640px) {
        font-size: 2.5rem;

    }

    line-height: normal;
}

.oyun-arkaplan {
    backdrop-filter: brightness(0.2) blur(3px);
}
</style>
