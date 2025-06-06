import { SliderPlugin } from '../plugins/SliderPlugin';

module 'phaser' {
  namespace Plugins {
    interface PluginManager {
      get(key: 'SliderPlugin'): SliderPlugin;
    }
  }
}
