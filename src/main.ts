import Phaser from 'phaser';
import '../style.css';
import { LoadingScene } from './scenes/LoadingScene';
import { StartScene } from './scenes/StartScene';
import { GameScene } from './scenes/GameScene';
import { HighScoreScene } from './scenes/HighScoreScene';
import { OptionsScene } from './scenes/OptionsScene';
import { GameOverScene } from './scenes/GameOverScene';
import { ServiceConfig } from './interface/serviceConfig';
import { ServiceBootstrapper } from './services/ServiceBootstrapper';
import SliderPlugin from './plugins/SliderPlugin';

console.log('Game starting...', window.location.href);

function getGameDimensions() {
  const isLandscape = window.innerWidth > window.innerHeight;
  const isDesktop = window.innerWidth >= 1024;

  if (isLandscape || isDesktop) {
    return {
      width: 1280,
      height: 720,
      minWidth: 640,
      minHeight: 360,
      maxWidth: 2560,
      maxHeight: 1440,
    };
  } else {
    return {
      width: 720,
      height: 1280,
      minWidth: 360,
      minHeight: 640,
      maxWidth: 1440,
      maxHeight: 2560,
    };
  }
}

const dimensions = getGameDimensions();
console.log('Game dimensions:', dimensions);

const bootstrapper = new ServiceBootstrapper();
const serviceConfig: ServiceConfig = {
  storage: {
    type: 'localStorage',
  },
};
bootstrapper.initializeServices(serviceConfig);

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: dimensions.width,
  height: dimensions.height,
  parent: 'phaser-game',
  backgroundColor: '#87CEEB',
  input: {
    activePointers: 5,
  },
  plugins: {
    global: [
      {
        key: 'SliderPlugin',
        plugin: SliderPlugin,
        start: true,
      },
    ],
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: dimensions.width,
    height: dimensions.height,
    min: {
      width: dimensions.minWidth,
      height: dimensions.minHeight,
    },
    max: {
      width: dimensions.maxWidth,
      height: dimensions.maxHeight,
    },
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 1000 },
      debug: false,
    },
  },
  scene: [LoadingScene, StartScene, GameScene, HighScoreScene, OptionsScene, GameOverScene],
};

window.addEventListener('load', () => {
  const game = new Phaser.Game(config);

  const resize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;

    let width = dimensions.width;
    let height = dimensions.height;
    let maxWidth = dimensions.maxWidth;
    let maxHeight = dimensions.maxHeight;
    let scaleMode = Phaser.Scale.RESIZE;

    let scale = Math.min(w / width, h / height);
    let newWidth = Math.min(w / scale, maxWidth);
    let newHeight = Math.min(h / scale, maxHeight);

    let defaultRatio = dimensions.width / dimensions.height;
    let maxRatioWidth = dimensions.maxWidth / dimensions.height;
    let maxRatioHeight = dimensions.width / dimensions.maxHeight;

    let smooth = 1;
    if (scaleMode === Phaser.Scale.RESIZE) {
      const maxSmoothScale = 1.15;
      const normalize = (value: number, min: number, max: number) => {
        return (value - min) / (max - min);
      };
      if (width / height < w / h) {
        smooth =
          -normalize(newWidth / newHeight, defaultRatio, maxRatioWidth) /
            (1 / (maxSmoothScale - 1)) +
          maxSmoothScale;
      } else {
        smooth =
          -normalize(newWidth / newHeight, defaultRatio, maxRatioHeight) /
            (1 / (maxSmoothScale - 1)) +
          maxSmoothScale;
      }
    }

    game.scale.resize(newWidth * smooth, newHeight * smooth);

    game.canvas.style.width = newWidth * scale + 'px';
    game.canvas.style.height = newHeight * scale + 'px';

    game.canvas.style.marginTop = `${(h - newHeight * scale) / 2}px`;
    game.canvas.style.marginLeft = `${(w - newWidth * scale) / 2}px`;
  };
  window.addEventListener('resize', event => {
    resize();
  });
  resize();
});
