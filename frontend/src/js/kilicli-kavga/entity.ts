import {TwoDVector} from "@/js/kilicli-kavga/utility/twoDVector";
import {Dikdortgen} from "@/js/kilicli-kavga/utility/dikdortgen";
import {Game} from "@/js/kilicli-kavga/game";
import {Sprite} from "@/js/kilicli-kavga/sprite";


export class Entity {
    id: number | string;
    game: Game;
    readonly pos: TwoDVector;
    readonly v: TwoDVector;
    readonly accel: TwoDVector;
    hasGravity;
    readonly gravity = new TwoDVector(0, 0.002);
    groundY: number;
    hitbox: Dikdortgen;
    sprite?: Sprite;
    canGoBeyondScreenBorders = false;

    constructor(id: number | string,
                tuval: Game,
                pos: TwoDVector = new TwoDVector(0, 0),
                v: TwoDVector = new TwoDVector(0, 0),
                accel: TwoDVector = new TwoDVector(0, 0),
                hasGravity = true,
                groundY = 100,
                width = 50,
                height = 100,
                sprite?: Sprite,) {
        this.id = id;
        this.game = tuval;
        this.pos = pos;
        this.v = v;
        this.accel = accel;
        this.hasGravity = hasGravity;
        this.groundY = groundY;
        this.hitbox = new Dikdortgen(this.game, this.pos, width, height);
        this.sprite = sprite;
    }

    beforeMove(): this {
        // override this method to add custom logic
        return this;
    }

    move(): this {
        this.beforeMove();
        // coordinates being whole numbers is important for performance (no need to draw sub-pixel objects with anti aliasing)
        this.pos.setAsInt(this.pos.add(this.v.multiply(this.game.thisFrameTimeInMs))); // x = x0 + vt

        if (this.hasGravity && this.hitbox.isOnTopOfSomething()) {
            this.v.y = 0;
            this.accel.y = 0;
            this.pos.y = this.hitbox.ayagininAlti();
        }
        if (!this.canGoBeyondScreenBorders) {
            if (this.pos.x < 0) {
                this.pos.x = 0;
            }
            if (this.pos.x + this.hitbox.w > this.game.width) {
                this.pos.x = this.game.width - this.hitbox.w;
            }
        }

        this.v.set(this.v.add(this.accel.multiply(this.game.thisFrameTimeInMs))); // v = v0 + at
        if (this.hasGravity) {
            this.v.set(this.v.add(this.gravity.multiply(this.game.thisFrameTimeInMs))); // v = v0 + gt
        }
        return this;
    }

    beforeUpdate(): this {
        // override this method to add custom logic
        return this;
    }

    update(): this {
        this.beforeUpdate();

        this.move();
        if (this.sprite) {
            this.sprite.start().update();
        }

        return this;
    }


}
