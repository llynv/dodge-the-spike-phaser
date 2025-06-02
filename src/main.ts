import Phaser from 'phaser';
import '../style.css';
import { LoadingScene } from './scenes/loading-scene';
import { StartScene } from './scenes/start-scene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 720,
  height: 1280,
  parent: 'phaser-game',
  backgroundColor: '#87CEEB',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 1000 },
      debug: true
    }
  },
  scene: [LoadingScene, StartScene]
};

const game = new Phaser.Game(config);
