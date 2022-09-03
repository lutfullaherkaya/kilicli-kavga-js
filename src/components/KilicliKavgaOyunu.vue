<template>
    <div>
        <v-form v-if="!oyuncuIsmiSecildi" ref="girdi-formu" v-model="girdiFormuUygun" lazy-validation class="mb-2"
                @submit="oyuncuOlustur">
            <v-text-field v-model="yeniOyuncuAdi" label="Yeni Oyuncu Adı" counter outlined maxlength="20"
                          :rules="[girdiKurallari.gerekli, girdiKurallari.counter, girdiKurallari.oyunculardaZatenOlmamali]">
            </v-text-field>
            <v-btn :disabled="!girdiFormuUygun" color="success" class="mr-4 mb-5 text-capitalize" type="submit">
                Oyuna Katıl
            </v-btn>
        </v-form>

        <kilicli-kavga-oyunu-oyun
                v-else
                :mobil-kontrolleri-goster="mobilKontrolleriGoster"
                :dokunmalidir="dokunmalidir"
                :socket="socket"
                :oyuncular="oyuncular"
                :bu-oyuncu-ismi="yeniOyuncuAdi"
        />

        <v-switch v-model="mobilKontrolleriGoster" inset label="Mobil Kontrolleri Göster"></v-switch>
        <v-simple-table>
            <template v-slot:default>
                <thead>
                <tr>
                    <th class="text-left">
                        Çevrim içi oyuncular
                    </th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="oyuncu in oyuncular" :key="oyuncu.isim">
                    <td>{{ oyuncu.isim }}</td>
                </tr>
                </tbody>
            </template>
        </v-simple-table>
        <vue-snotify></vue-snotify>
    </div>

</template>

<script lang="ts">
import Vue from 'vue';
import {io} from "socket.io-client";
import axios from "axios";
import KilicliKavgaOyunuOyun from "@/components/KilicliKavgaOyunuOyun.vue";

export default Vue.extend({
    name: 'KilicliKavgaOyunu',
    components: {KilicliKavgaOyunuOyun},


    data() {
        return {
            oyuncular: [] as any[],
            dokunmalidir: false,
            mobilKontrolleriGoster: false,
            socket: io(),
            rakipIsmi: '',
            yeniOyuncuAdi: '',
            oyuncuIsmiSecildi: false,
            girdiFormuUygun: true,
            girdiKurallari: {
                gerekli: (value: any) => !!value || 'Gereklidir.',
                oyunculardaZatenOlmamali: (value: any) => {
                    if (value) {
                        for (let oyuncu of (this as any).oyuncular) {
                            if (oyuncu.isim == value) {
                                return 'Bu isimde bir oyuncu zaten var.';
                            }
                        }
                    }
                    return true;
                },
                counter: (value: any) => value.length <= 20 || 'En fazla 20 karakter giriniz.',
            },
        }
    },

    methods: {
        mobilMi(): boolean {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },
        dokunmaliMi(): boolean {
            return (('ontouchstart' in window) ||
                    (navigator.maxTouchPoints > 0) ||
                    (navigator.msMaxTouchPoints > 0));
        },
        oyuncuOlustur() {
            axios.post('/oyuncular', {
                isim: this.yeniOyuncuAdi,
            }).then(response => {
                (this as any).$snotify.success(response.data.isim + ' oyuncusu oluşturuldu.');
                this.oyuncuIsmiSecildi = true;
                this.socket.emit('oyuncuyu sockete bagla', {
                    isim: response.data.isim,
                });

            }).catch(error => {
                (this as any).$snotify.error(error.response.data.message);
            });

        },


    },
    beforeMount() {
        this.dokunmalidir = this.dokunmaliMi();
        this.mobilKontrolleriGoster = this.mobilMi();
    },
    mounted() {
        axios.get('/oyuncular').then(response => {
            this.oyuncular = Object.values(response.data);
        }).catch(error => {
            (this as any).$snotify.error(error.response.data.message);
        });
        this.socket.on('oyuncu guncel listesi', (msg) => {
            this.oyuncular = Object.values(msg);

        })


    },
    destroyed() {
        this.socket.disconnect();

    }


})

</script>

<style scoped lang="scss">


</style>
