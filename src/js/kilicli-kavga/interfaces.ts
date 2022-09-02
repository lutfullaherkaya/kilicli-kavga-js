export interface Kordinat {
    x: number;
    y: number;
}

export interface Boyut {
    x: number;
    y: number;
}

export interface SavasciKontrolleri {
    saldiri: boolean;
    taklaAt: boolean;
    solKosu: boolean;
    sonKosulanYonSagdir: boolean;
    sagKosu: boolean;
    zipla: boolean
}

export interface OyunBilgisi {
    isim: string;
    kontroller: Partial<SavasciKontrolleri>;
}
