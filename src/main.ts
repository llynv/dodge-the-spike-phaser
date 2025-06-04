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

console.log('Creating Phaser game...');
const game = new Phaser.Game(config);

game.events.on('ready', () => {
  console.log('Phaser game ready!');
});

window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    const newDimensions = getGameDimensions();
    game.scale.setGameSize(newDimensions.width, newDimensions.height);
    game.scale.refresh();
  }, 500);
});

window.addEventListener('resize', () => {
  const newDimensions = getGameDimensions();
  game.scale.setGameSize(newDimensions.width, newDimensions.height);
  game.scale.refresh();
});

window.addEventListener('error', event => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);
});
