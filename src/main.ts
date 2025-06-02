import Phaser from 'phaser';
import '../style.css';
import { LoadingScene } from './scenes/loading-scene';
import { StartScene } from './scenes/start-scene';
import { GameScene } from './scenes/game-scene';
import { HighScoreScene } from './scenes/highscore-scene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 720,
  height: 1280,
  parent: 'phaser-game',
  backgroundColor: '#87CEEB',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 720,
    height: 1280,
    min: {
      width: 360,
      height: 640
    },
    max: {
      width: 1440,
      height: 2560
    }
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 1000 },
      debug: false
    }
  },
  scene: [LoadingScene, StartScene, GameScene, HighScoreScene]
};

const game = new Phaser.Game(config);
