import {TwoDVector} from "@/js/kilicli-kavga/utility/twoDVector";
import {Dikdortgen} from "@/js/kilicli-kavga/utility/dikdortgen";
import {Tuval} from "@/js/kilicli-kavga/tuval";
import {Sprite} from "@/js/kilicli-kavga/sprite";


export class Entity {
    id: number | string;
    tuval: Tuval;
    position: TwoDVector;
    velocity: TwoDVector;
    acceleration: TwoDVector;
    hasGravity;
    gravity = new TwoDVector(0, 0.098);
    groundY: number;
    hitbox: Dikdortgen;
    sprite?: Sprite;


    constructor(id: number | string,
                tuval: Tuval,
                position: TwoDVector = new TwoDVector(0, 0),
                velocity: TwoDVector = new TwoDVector(0, 0),
                acceleration: TwoDVector = new TwoDVector(0, 0),
                hasGravity = true,
                groundY = 100,
                width = 50,
                height = 100,
                sprite?: Sprite,) {
        this.id = id;
        this.tuval = tuval;
        this.position = position;
        this.velocity = velocity;
        this.acceleration = acceleration;
        this.hasGravity = hasGravity;
        this.groundY = groundY;
        this.hitbox = new Dikdortgen(this.tuval, this.position, width, height);
        this.sprite = sprite;
    }

    move() {
        this.position.set(this.position.add(this.velocity.divide(this.tuval.speedOfTime())));

        if (this.hasGravity && this.hitbox.yerdedir()) {
            this.velocity.y = 0;
            this.acceleration.y = 0;
            this.position.y = this.hitbox.ayagininAlti();
        }

        this.velocity.set(this.velocity.add(this.acceleration.divide(this.tuval.speedOfTime())));
        if (this.hasGravity) {
            this.velocity.set(this.velocity.add(this.gravity.divide(this.tuval.speedOfTime())));
        }
    }
}
