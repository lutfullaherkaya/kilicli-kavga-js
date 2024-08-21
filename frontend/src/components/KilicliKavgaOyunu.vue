<template>
    <div class="container mx-auto p-4">
        <form v-if="!oyuncuIsmiSecildi" class="mb-2" @submit.prevent="oyuncuOlustur">

            <div class="mt-10">
                <FloatLabel>
                    <label for="playername">Yeni Oyuncu Adı</label>
                    <InputText id="playername" v-model="yeniOyuncuAdi" size="large" />
                </FloatLabel>
                <Message class="mt-2" v-if="yeniOyuncuAdiZatenVar" severity="error">Bu kullanıcı zaten var.</Message>
                <Message class="mt-2" v-if="yeniOyuncuAdi > 20" severity="error">Kullanıcı adı en fazla 20 karakter
                    olabilir.</Message>
            </div>


            <Button label="Oyuna Katıl" :disabled="!girdiFormuUygun" class="mt-3" type="submit" />
        </form>

         <KilicliKavgaOyunuOyun
                v-else
                ref="oyun"
                :mobil-kontrolleri-goster="mobilKontrolleriGoster"
                :dokunmalidir="dokunmalidir"
                :socket="socket"
                :oyuncular="oyuncular"
                :bu-oyuncu-ismi="yeniOyuncuAdi"
        />

        <template v-if="oyuncuIsmiSecildi">
            <div class="flex flex-row">
                <ToggleSwitch v-model="mobilKontrolleriGoster" />
                <span class="ml-2">Mobil Kontrolleri Göster</span>
            </div>

            <Button @click="tamEkraniAc">
                Tam Ekranı Aç
            </Button>
        </template>

        <h2 class="mt-3">Çevrim İçi Oyuncular</h2>
        
        <DataTable :value="oyuncular" class="mt-2">
            <Column field="isim" header="Oyuncu Adı"></Column>
        </DataTable>
        

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
    (oyun.value as any)?.tamEkraniAc();
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

<style scoped></style>
