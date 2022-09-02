export class Tuval {
    canvas: HTMLCanvasElement;
    yerKordinati: number;
    context: CanvasRenderingContext2D | null;
    private zaman: number;
    fps: number;

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
     *  Benim ekranım 144hz olduğu için 144hz'ye göre hesaplıyorum. Mesela 60 fps'de iki kat hızlı olması gerek bundan
     *  dolayı animasyonların.
     */
    gercekHiz(hiz: number) {
        return hiz * 144 / this.fps;
    }

    gercekSahneSayisi(sahneSayisi: number) {
        return Math.max(1, Math.round(sahneSayisi * this.fps / 144));
    }
}