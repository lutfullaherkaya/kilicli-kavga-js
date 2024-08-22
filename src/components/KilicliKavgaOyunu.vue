<template>
    <div class="container mx-auto p-4">
        <div class="flex flex-col items-center sm:mt-5">
            <img src="../assets/logo/kiliclikavga.svg" alt="Lerkaya Games logosu" width="422" height="157"
                style="height: auto;" class="w-full max-w-md">
            <div class="w-full max-w-md" v-if="!oyuncuIsmiSecildi">
                <img src="../assets/logo/lerkayagames.svg" alt="Lerkaya Games logosu" width="986" height="104"
                    style="height: auto;" class="w-full mt-1 max-w-[180px] float-right mr-3">
            </div>

        </div>
        <template v-if="!oyuncuIsmiSecildi">
            <div class="text-center mt-6 golgeli oyun-fontu text-white ana-sayfa-yazi">
                Lerkaya Games ailesine hoş geldiniz! Oyunumuza katılmak için hemen bir isim seçin:
            </div>


            <form class="mb-2 flex flex-col items-center" @submit.prevent="oyuncuOlustur">
                <div class="mt-4 flex justify-center">


                    <InputText placeholder="Oyuncu adı..." id="playername" v-model="yeniOyuncuAdi" size="large" />

                    <Message class="mt-2" v-if="yeniOyuncuAdiZatenVar" severity="error">Bu kullanıcı zaten var.
                    </Message>
                    <Message class="mt-2" v-if="yeniOyuncuAdi > 20" severity="error">Kullanıcı adı en fazla 20 karakter
                        olabilir.</Message>
                </div>

                <Button label="Oyuna Katıl" :disabled="!girdiFormuUygun" class="mt-3" type="submit" />

            </form>
        </template>
        <KilicliKavgaOyunuOyun v-else ref="oyun" class="my-3" :mobil-kontrolleri-goster="mobilKontrolleriGoster"
            :dokunmalidir="dokunmalidir" :socket="socket" :oyuncular="oyuncular" :bu-oyuncu-ismi="yeniOyuncuAdi" />

        <template v-if="oyuncuIsmiSecildi">
            <div class="flex flex-row text-white">
                <ToggleSwitch v-model="mobilKontrolleriGoster" />
                <span class="ml-2">Mobil Kontrolleri Göster</span>
            </div>

            <Button @click="tamEkraniAc">
                Tam Ekranı Aç
            </Button>
        </template>

        <Card class="mt-6" :pt="{ body: { class: 'px-2 pt-1' } }">
            <template #content>
                <DataTable :value="oyuncular">
                    <Column field="isim" header="Çevrim İçi Oyuncular" headerStyle="text-align:center"
                        bodyStyle="text-align:center">
                    </Column>
                </DataTable>
            </template>
        </Card>


        <p class="text-center ana-sayfa-yazi oyun-fontu text-white mt-6">
            Yapımcı: Lütfullah Erkaya
        </p>


    </div>

</template>

<script lang="ts" setup>
import { io } from "socket.io-client";
import axios from "axios";
import KilicliKavgaOyunuOyun from "@/components/KilicliKavgaOyunuOyun.vue";
import ToggleSwitch from 'primevue/toggleswitch';

const oyun = ref(null)
const oyuncular = ref([]);
const dokunmalidir = ref(false)
const mobilKontrolleriGoster = ref(false);
const socket = io()
const rakipIsmi = ref('')
const yeniOyuncuAdi = ref('')
const oyuncuIsmiSecildi = ref(false)

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



function tamEkraniAc() {
    oyun.value.tamEkraniAc();
}

function mobilMi(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

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
    mobilKontrolleriGoster.value = mobilMi();
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
        0px 0px 10px rgba(0, 0, 0, 0.9);

    font-size: 1.875rem;
    line-height: normal;
}
</style>
