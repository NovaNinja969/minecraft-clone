import { Game } from './game';

window.addEventListener('load', () => {
    const game = new Game();
    game.init();
    game.run();
});

declare global {
    interface Window {
        game: Game;
    }
}
