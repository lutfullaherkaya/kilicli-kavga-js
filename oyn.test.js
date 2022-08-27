/**
 * @jest-environment jsdom
 */

var Oyn = require('./oyn.js');

describe("Sprite testleri", () => {
    beforeEach(() => {
        document.documentElement.innerHTML = "<html><head></head><body><canvas></canvas></body></html>";
        tuval = new Oyn.Tuval(document.querySelector('canvas'), 800, 600);

    });
    describe('rölatif pozisyon testleri', () => {
        beforeEach(() => {
            const basilanTuslar = {}
            // {5}
            //      {6} // kesişiyor yukarısında
            // {1}  {2}{34}
            sprite1 = new Oyn.Sprite(tuval, {
                renk: '#ff0000',
                pozisyon: { x: 0, y: tuval.canvas.height - 100 },
                hiz: { x: 0, y: 0 },
                ivme: { x: 0, y: 0 },
                solTusu: 'ArrowLeft',
                sagTusu: 'ArrowRight',
                genislik: 50,
                yukseklik: 100,
                basilanTuslar,
            });
            sprite2 = new Oyn.Sprite(tuval, {
                renk: '#ff0000',
                pozisyon: { x: 100, y: tuval.canvas.height - 100 },
                hiz: { x: 0, y: 0 },
                ivme: { x: 0, y: 0 },
                solTusu: 'ArrowLeft',
                sagTusu: 'ArrowRight',
                genislik: 50,
                yukseklik: 100,
                basilanTuslar,
            });
            sprite3 = new Oyn.Sprite(tuval, {
                renk: '#ff0000',
                pozisyon: { x: 150, y: tuval.canvas.height - 100 },
                hiz: { x: 0, y: 0 },
                ivme: { x: 0, y: 0 },
                solTusu: 'ArrowLeft',
                sagTusu: 'ArrowRight',
                genislik: 50,
                yukseklik: 100,
                basilanTuslar,
            });
            sprite4 = new Oyn.Sprite(tuval, {
                renk: '#ff0000',
                pozisyon: { x: 175, y: tuval.canvas.height - 100 },
                hiz: { x: 0, y: 0 },
                ivme: { x: 0, y: 0 },
                solTusu: 'ArrowLeft',
                sagTusu: 'ArrowRight',
                genislik: 50,
                yukseklik: 100,
                basilanTuslar,
            });
            sprite5 = new Oyn.Sprite(tuval, {
                renk: '#ff0000',
                pozisyon: { x: 0, y: tuval.canvas.height - 200 },
                hiz: { x: 0, y: 0 },
                ivme: { x: 0, y: 0 },
                solTusu: 'ArrowLeft',
                sagTusu: 'ArrowRight',
                genislik: 50,
                yukseklik: 100,
                basilanTuslar,
            });
            sprite6 = new Oyn.Sprite(tuval, {
                renk: '#ff0000',
                pozisyon: { x: 100, y: tuval.canvas.height - 150 },
                hiz: { x: 0, y: 0 },
                ivme: { x: 0, y: 0 },
                solTusu: 'ArrowLeft',
                sagTusu: 'ArrowRight',
                genislik: 50,
                yukseklik: 100,
                basilanTuslar,
            });
        });
        test('solundadır', () => {
            expect(sprite1.solundadir(sprite2)).toBe(true);
            expect(sprite2.solundadir(sprite1)).toBe(false);
            expect(sprite2.solundadir(sprite3)).toBe(true);
            expect(sprite3.solundadir(sprite4)).toBe(false);
        });
        test('sagindadir', () => {
            expect(sprite2.sagindadir(sprite1)).toBe(true);
            expect(sprite1.sagindadir(sprite2)).toBe(false);
            expect(sprite3.sagindadir(sprite2)).toBe(true);
            expect(sprite3.sagindadir(sprite4)).toBe(false);
            expect(sprite4.sagindadir(sprite3)).toBe(false);
        });
        test('yukarisindadir', () => {
            expect(sprite5.yukarisindadir(sprite1)).toBe(true);
            expect(sprite6.yukarisindadir(sprite2)).toBe(false);
        });
    })

})
