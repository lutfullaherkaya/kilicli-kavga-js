import {Tuval} from "@/js/kilicli-kavga/tuval";
import {Sprite} from "@/js/kilicli-kavga/sprite";

export class SpriteWithSound extends Sprite {
    private sound: HTMLAudioElement | null = null;
    private readonly soundLoops
    private playedOnce = false;

    constructor(tuval: Tuval, {
        soundSrc = '',
        soundLoops = false,
        ...spriteOptions
    }) {
        super(tuval, spriteOptions);
        this.soundLoops = soundLoops;
        if (soundSrc) {
            this.sound = new Audio(soundSrc);
            /*if (soundLoops) {
                this.sound.loop = true; // we can't do this since chrome android loops with delay.
            }*/
        }
    }

    rewindToBeginning(): this {
        super.rewindToBeginning();
        if (this.sound) {
            this.sound.currentTime = 0;
            this.playedOnce = false;
        }
        return this;
    }

    soundIsEnded(): boolean {
        if (this.sound) {
            return this.sound.duration <= this.sound.currentTime;
        } else {
            return false;
        }

    }

    start(): this {
        super.start();
        if (this.sound && (!this.playedOnce || this.soundLoops)) {
            this.sound.play().then(() => {
                this.playedOnce = true;
            });
        }
        return this;
    }

    pause(): this {
        super.pause();
        if (this.sound) {
            this.sound.pause();
            console.log(this.sound.duration)

        }
        return this;
    }

    update() {
        super.update();
        if (this.sound) {
            if (this.soundIsEnded() && this.soundLoops && this.isPlaying) {
                /*this.sound.currentTime = 0;
                this.sound.play();*/
                this.sound = new Audio(this.sound.src); // this is neccesary for chrome android. Otherwise, sound will loop with delay.

            }
        }
        return this;
    }

}
