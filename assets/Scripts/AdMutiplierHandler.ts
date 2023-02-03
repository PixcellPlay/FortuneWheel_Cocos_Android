import { _decorator, Component, Node, Label } from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('AdMutiplierHandler')
export class AdMutiplierHandler extends Component {

    tempAdMultiplier: number = 1;

    start() {
        GameManager.Instance.uiHandler.adMultiplier = 1;
    }

    update(deltaTime: number) {
        GameManager.Instance.uiHandler.checkAdMutiplierIndication();
        if (this.tempAdMultiplier != GameManager.Instance.uiHandler.adMultiplier) {
            GameManager.Instance.uiHandler.piggyBankDoubleButton.getComponentInChildren(Label).string = (Math.round(GameManager.Instance.uiHandler._piggyFinalReward[1] * GameManager.Instance.uiHandler.adMultiplier)).toString();
            this.tempAdMultiplier = GameManager.Instance.uiHandler.adMultiplier;
        }
    }
}

