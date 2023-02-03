import { _decorator, Component, Node } from 'cc';
import { GameManager } from './GameManager';
import gameanalytics, { GameAnalytics } from 'gameanalytics'
const { ccclass, property } = _decorator;

@ccclass('AnalyticsManager')
export class AnalyticsManager extends Component {

    public static Instance: AnalyticsManager;  // Making it as a Singleton

    start() {
        if (AnalyticsManager.Instance == null) {
            AnalyticsManager.Instance = this;
        }
        //To Access GAmeAnalytics install game analytics through npm
        gameanalytics .GameAnalytics.setEnabledInfoLog(true);
        gameanalytics.GameAnalytics.initialize("f51edd08df2b62b3c1084fcf90033a72", "eafe29d8ba25672e3450a9874270b193fb83cd64");
        console.log(gameanalytics);
        console.log(gameanalytics.GameAnalytics.isSdkReady());
    }


    onLevelComplete() {
        let currentLevel = "Level" + GameManager.Instance.currentUpgradeLevel.toString();
        gameanalytics.GameAnalytics.addProgressionEvent(gameanalytics.EGAProgressionStatus.Complete, currentLevel);
    }


    // onLevelStart() {
    //     let currentLevel = "Level" + LevelManager.Instance.level.toString();
    //     gameanalytics.GameAnalytics.addProgressionEvent(gameanalytics.EGAProgressionStatus.Start, currentLevel);
    // }


    // onLevelFail() {
    //     let currentLevel = "Level" + GameManager.Instance.currentUpgradeLevel.toString();
    //     gameanalytics.GameAnalytics.addProgressionEvent(gameanalytics.EGAProgressionStatus.Fail, currentLevel);
    // }


    onShare() {
        gameanalytics.GameAnalytics.addDesignEvent("Share");
    }


    onMusicOff() {
        gameanalytics.GameAnalytics.addDesignEvent("Music", "Off");
    }


    onMusicOn() {
        gameanalytics.GameAnalytics.addDesignEvent("Music", "On");
    }


    onSFXOff() {
        gameanalytics.GameAnalytics.addDesignEvent("SFX", "Off");
    }


    onSFXOn() {
        gameanalytics.GameAnalytics.addDesignEvent("SFX", "On");
    }


    forMultiplier(multiplier : number){
        let temp = multiplier.toString();
        gameanalytics.GameAnalytics.addDesignEvent("MULTIPLIER",temp);
    }



    onOutofEnergyPopUpShow() {
        gameanalytics.GameAnalytics.addDesignEvent("ENERGY DRAINED OUT");
    }

    onAdButtonClickedEnergy() {
        gameanalytics.GameAnalytics.addDesignEvent("REWARDED AD", "ENERGY");
    }


    onAdShow() {
        gameanalytics.GameAnalytics.addDesignEvent("Advt","RewardedVideo","AdShown");
    }

    onAdFailToShow() {
        gameanalytics.GameAnalytics.addDesignEvent("Advt","RewardedVideo","FailedShow");
    }


    onDailyGiftAdButtonClicked() {
        gameanalytics.GameAnalytics.addDesignEvent("REWARDED AD", "DAILY GIFT");
    }
    
    onDailyGiftBoxOpen(boxno : number) {
        let temp = "BOX" + boxno.toString();
        gameanalytics.GameAnalytics.addDesignEvent(temp);
    }
    
    onChestOpenwithKey(){
        gameanalytics.GameAnalytics.addDesignEvent("CHEST" , "OPENWITHKEY");
    }
    
    onChestOpenwithAdClicked(){
        gameanalytics.GameAnalytics.addDesignEvent("CHEST" , "ADCLICKED");
    }

    onChestOpenwithAdShown(){
        gameanalytics.GameAnalytics.addDesignEvent("CHEST" , "ADWATCHED");
    }
    
    onChestDoubleRewardedAd(){
        gameanalytics.GameAnalytics.addDesignEvent("CHEST", "2XREWARDEDAD");
    }

    onChestRewardCollect(){
        gameanalytics.GameAnalytics.addDesignEvent("CHEST","COLLECTED");
    }

    onPiggyAdMultiplier(rewardType:any , multiplier :number){
        gameanalytics.GameAnalytics.addDesignEvent("PIGGY",rewardType,multiplier.toString());
        gameanalytics.GameAnalytics.addDesignEvent("PIGGY","REWARDEDAD");
    }

    onPiggyRewardCollected() {
        gameanalytics.GameAnalytics.addDesignEvent("PIGGY", "REWARDCOLLECTED");
    }





    onAdFailForGainLives() {
        gameanalytics.GameAnalytics.addDesignEvent("Advt","RewardedVideo","FailedShow","GainLives");
    }


    onAdInterstetialShown() {
        gameanalytics.GameAnalytics.addDesignEvent("Advt","Interstitial","AdShown");
    }


    onAdInterstetialFailedShow() {
        gameanalytics.GameAnalytics.addDesignEvent("Advt","Interstitial","FailedShow");
    }
}

