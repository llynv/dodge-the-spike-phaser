export interface AudioConfig {
  volume: number;
  muted: boolean;
}

export interface GameAudio {
  menuMusic: Phaser.Sound.BaseSound | null;
  gameMusic: Phaser.Sound.BaseSound | null;

  playerJump: Phaser.Sound.BaseSound | null;
  playerLand: Phaser.Sound.BaseSound | null;
  playerHurt: Phaser.Sound.BaseSound | null;
  playerDie: Phaser.Sound.BaseSound | null;

  enemyExplode: Phaser.Sound.BaseSound | null;
  enemySpawn: Phaser.Sound.BaseSound | null;

  buttonClick: Phaser.Sound.BaseSound | null;
  buttonHover: Phaser.Sound.BaseSound | null;
  scoreIncrease: Phaser.Sound.BaseSound | null;
  gameOver: Phaser.Sound.BaseSound | null;
}

export class AudioService {
  private static instance: AudioService;
  private scene: Phaser.Scene | null = null;
  private sounds: GameAudio;
  private musicConfig: AudioConfig = { volume: 0.7, muted: false };
  private sfxConfig: AudioConfig = { volume: 0.8, muted: false };
  private audioUnlocked: boolean = false;

  private constructor() {
    this.sounds = {
      menuMusic: null,
      gameMusic: null,
      playerJump: null,
      playerLand: null,
      playerHurt: null,
      playerDie: null,
      enemyExplode: null,
      enemySpawn: null,
      buttonClick: null,
      buttonHover: null,
      scoreIncrease: null,
      gameOver: null,
    };
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  public initialize(scene: Phaser.Scene): void {
    this.scene = scene;
    this.loadSounds();
    this.loadSettings();
  }

  private loadSounds(): void {
    if (!this.scene) return;

    const audioConfig = {
      music: [
        {
          key: 'menuMusic',
          asset: 'menu_music',
          volume: this.musicConfig.volume * 0.5,
          loop: true,
        },
        { key: 'gameMusic', asset: 'game_music', volume: this.musicConfig.volume, loop: true },
      ],
      sfx: [
        { key: 'playerJump', asset: 'player_jump', volume: this.sfxConfig.volume },
        { key: 'playerLand', asset: 'player_land', volume: this.sfxConfig.volume },
        { key: 'playerHurt', asset: 'player_hurt', volume: this.sfxConfig.volume },
        { key: 'playerDie', asset: 'player_die', volume: this.sfxConfig.volume },
        { key: 'enemyExplode', asset: 'enemy_explode', volume: this.sfxConfig.volume },
        { key: 'enemySpawn', asset: 'enemy_spawn', volume: this.sfxConfig.volume * 0.6 },
        { key: 'buttonClick', asset: 'button_click', volume: this.sfxConfig.volume },
        { key: 'buttonHover', asset: 'button_hover', volume: this.sfxConfig.volume * 0.5 },
        { key: 'scoreIncrease', asset: 'score_increase', volume: this.sfxConfig.volume * 0.7 },
        { key: 'gameOver', asset: 'game_over', volume: this.sfxConfig.volume },
      ],
    };

    for (const item of audioConfig.music) {
      try {
        this.sounds[item.key as keyof GameAudio] = this.scene.sound.add(item.asset, {
          volume: item.volume,
          loop: item.loop,
        });
      } catch (e) {
        console.warn(`Failed to load ${item.key}:`, e);
      }
    }

    for (const item of audioConfig.sfx) {
      try {
        this.sounds[item.key as keyof GameAudio] = this.scene.sound.add(item.asset, {
          volume: item.volume,
        });
      } catch (e) {
        console.warn(`Failed to load ${item.key}:`, e);
      }
    }
  }

  private async unlockAudio(): Promise<void> {
    if (this.audioUnlocked || !this.scene) return;

    try {
      const soundManager = this.scene.sound as Phaser.Sound.WebAudioSoundManager;
      if (soundManager.context && soundManager.context.state === 'suspended') {
        await soundManager.context.resume();
      }
      this.audioUnlocked = true;
      console.log('Audio context unlocked');
    } catch (e) {
      console.warn('Failed to unlock audio context:', e);
    }
  }

  public async playMenuMusic(): Promise<void> {
    await this.unlockAudio();
    this.sounds.gameMusic?.stop();

    if (!this.sounds.menuMusic || this.musicConfig.muted || !this.audioUnlocked) return;
    this.sounds.menuMusic.play();
  }

  public async playGameMusic(): Promise<void> {
    await this.unlockAudio();
    this.sounds.menuMusic?.stop();

    if (!this.sounds.gameMusic || this.musicConfig.muted || !this.audioUnlocked) return;
    this.sounds.gameMusic.play();
  }

  public stopAllMusic(): void {
    this.sounds.menuMusic?.stop();
    this.sounds.gameMusic?.stop();
  }

  public stopMenuMusic(): void {
    this.sounds.menuMusic?.stop();
  }

  public stopGameMusic(): void {
    this.sounds.gameMusic?.stop();
  }

  public async playPlayerJump(): Promise<void> {
    await this.unlockAudio();
    this.playSound('playerJump');
  }

  public async playPlayerLand(): Promise<void> {
    await this.unlockAudio();
    this.playSound('playerLand');
  }

  public async playPlayerHurt(): Promise<void> {
    await this.unlockAudio();
    this.playSound('playerHurt');
  }

  public async playPlayerDie(): Promise<void> {
    await this.unlockAudio();
    this.playSound('playerDie');
  }

  public async playEnemyExplode(): Promise<void> {
    await this.unlockAudio();
    this.playSound('enemyExplode');
  }

  public async playEnemySpawn(): Promise<void> {
    await this.unlockAudio();
    this.playSound('enemySpawn');
  }

  public async playButtonClick(): Promise<void> {
    await this.unlockAudio();
    this.playSound('buttonClick');
  }

  public async playButtonHover(): Promise<void> {
    await this.unlockAudio();
    this.playSound('buttonHover');
  }

  public async playScoreIncrease(): Promise<void> {
    await this.unlockAudio();
    this.playSound('scoreIncrease');
  }

  public async playGameOver(): Promise<void> {
    await this.unlockAudio();
    this.playSound('gameOver');
  }

  private playSound(soundKey: keyof GameAudio): void {
    const sound = this.sounds[soundKey];
    if (!sound || this.sfxConfig.muted || !this.audioUnlocked) return;
    sound.play();
  }

  public setMusicVolume(volume: number): void {
    this.musicConfig.volume = Phaser.Math.Clamp(volume, 0, 1);
    this.updateMusicVolume();
    this.saveSettings();
  }

  public setSfxVolume(volume: number): void {
    this.sfxConfig.volume = Phaser.Math.Clamp(volume, 0, 1);
    this.updateSfxVolume();
    this.saveSettings();
  }

  public toggleMusic(): void {
    this.musicConfig.muted = !this.musicConfig.muted;
    if (this.musicConfig.muted) {
      this.stopAllMusic();
    }
    this.saveSettings();
  }

  public toggleSfx(): void {
    this.sfxConfig.muted = !this.sfxConfig.muted;
    this.saveSettings();
  }

  private updateMusicVolume(): void {
    ['menuMusic', 'gameMusic'].forEach(key => {
      const sound = this.sounds[key as keyof GameAudio] as
        | Phaser.Sound.HTML5AudioSound
        | Phaser.Sound.WebAudioSound;
      if (!sound) return;
      sound.volume = this.musicConfig.volume;
    });
  }

  private updateSfxVolume(): void {
    Object.keys(this.sounds).forEach(key => {
      const sound = this.sounds[key as keyof GameAudio] as
        | Phaser.Sound.HTML5AudioSound
        | Phaser.Sound.WebAudioSound;
      if (!sound || key === 'menuMusic' || key === 'gameMusic') return;
      sound.volume = this.sfxConfig.volume;
    });
  }

  private saveSettings(): void {
    const settings = {
      music: this.musicConfig,
      sfx: this.sfxConfig,
    };
    localStorage.setItem('gameAudioSettings', JSON.stringify(settings));
  }

  private loadSettings(): void {
    const saved = localStorage.getItem('gameAudioSettings');
    if (!saved) return;
    try {
      const settings = JSON.parse(saved);
      this.musicConfig = { ...this.musicConfig, ...settings.music };
      this.sfxConfig = { ...this.sfxConfig, ...settings.sfx };
      this.updateMusicVolume();
      this.updateSfxVolume();
    } catch (e) {
      console.warn('Failed to load audio settings');
    }
  }

  public getMusicVolume(): number {
    return this.musicConfig.volume;
  }

  public getSfxVolume(): number {
    return this.sfxConfig.volume;
  }

  public isMusicMuted(): boolean {
    return this.musicConfig.muted;
  }

  public isSfxMuted(): boolean {
    return this.sfxConfig.muted;
  }

  public destroy(): void {
    this.stopAllMusic();
    Object.values(this.sounds).forEach(sound => {
      if (sound) {
        sound.destroy();
      }
    });
  }
}
