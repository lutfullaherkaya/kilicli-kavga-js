import {Warrior} from "@/js/kilicli-kavga/warrior";
import {Entity} from "@/js/kilicli-kavga/entity";

export class Game {
    canvas: HTMLCanvasElement | null = null;
    context: CanvasRenderingContext2D | null = null;
    width = 0;
    height = 0;
    groundLevelY: number;
    private timeLeft: number;
    fps = 60; // to be updated outside of class
    warriors: Warrior[] = [];
    entities: Entity[] = [];
    thisFrameTimeInMs = 0;

    constructor(canvas: HTMLCanvasElement | null, width: number, height: number, groundLevelY: number) {
        if (canvas) {
            this.canvas = canvas;
            this.canvas.width = width;
            this.canvas.height = height;
            this.context = this.canvas.getContext('2d');
            if (this.context) {
                this.context.imageSmoothingEnabled = false;
                this.context.font = "0.8rem 'arial' ";
            }
        }
        this.width = width;
        this.height = height;

        this.groundLevelY = groundLevelY;
        this.timeLeft = 90;
        this.cleanCanvas();
    }


    cleanCanvas() {
        if (this.context && this.canvas) {
            this.context.fillStyle = '#0b2e2f';
            this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    setTimeLeftInUI() {
        document.getElementById('zaman')!.innerText = String(this.timeLeft--);
    }

    relativeFrameCount(sahneSayisi: number) {
        return Math.max(1, Math.round(
            sahneSayisi * this.fps / 144
        ));
    }
}
