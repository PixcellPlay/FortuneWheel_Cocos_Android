import { _decorator, Component, CCInteger, SpriteFrame, CCString } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WheelPiece')
export class WheelPiece extends Component {

    @property({ type: SpriteFrame })
    public pieceIcon: SpriteFrame[] = [];

    @property({ type: CCString })
    public generatedPieceName: string[] = [];

    @property({ type: CCInteger })
    public generatedRewardAmount: number[] = [];

    @property({ type: CCInteger })
    public pieceIndex: number[] = [];

    @property({ type: CCInteger })
    public pieceChance: number[] = [];

    @property({ type: CCInteger })
    public pieceWieghtage: number[] = [];

    start() {

    }

    update(deltaTime: number) {

    }
}

