import {Warrior} from "@/js/kilicli-kavga/warrior";

export class Tuval {
    canvas: HTMLCanvasElement;
    yerKordinati: number;
    context: CanvasRenderingContext2D | null;
    private zaman: number;
    fps: number;
    warriors: Warrior[] = [];

    constructor(canvas: HTMLCanvasElement, genislik: number, yukseklik: number, yerKordianti: number) {
        this.canvas = canvas;
        this.canvas.width = genislik;
        this.canvas.height = yukseklik;
        this.yerKordinati = yerKordianti;
        this.context = this.canvas.getContext('2d');
        this.context!.imageSmoothingEnabled = false;
        this.context!.font = "0.8rem 'arial' ";
        this.zaman = 90;
        this.temizle();
        this.fps = 60; // bu değer sürekli güncellenecek

    }

    temizle() {
        this.context!.fillStyle = '#0b2e2f';
        this.context!.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setZamanKutucugu() {
        document.getElementById('zaman')!.innerText = String(this.zaman--);

    }

    /**
     * Time gets slower with lower fps.
     * I test the time with 144hz monitor, thus my reference of the speed of time is this.
     */
    avgTimeUnit() {
        return this.fps / 144;
    }

    gercekSahneSayisi(sahneSayisi: number) {
        return Math.max(1, Math.round(sahneSayisi * this.fps / 144));
    }
}
