import { _decorator, Component, instantiate, Node, Animation, Prefab, EditBox } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ZombieTest')
export class ZombieTest extends Component {
    // Zombie prefab reference (assign in editor)
    @property(Node)
    zombiePrefab: Node = null;
    @property(Node)
    FrozenDeath: Node = null;
    @property(Node)
    FrozenDeathMulti: Node = null;
    @property({ tooltip: "Number of zombies to spawn" })
    private spawnCount: number = 1000;

    @property({ tooltip: "Toggle to spawn/destroy prefabs" })
    private isSpawning: boolean = false;

    @property(EditBox)
    private editbox: EditBox = null!;

    private zombieContainer: Node = null;

    start() {
        // Initialize container but don't spawn yet
        this.zombieContainer = new Node('ZombieContainer');
        this.zombieContainer.parent = this.node;
    }

    clickToggle() {
        this.isSpawning = !this.isSpawning;
    }

    clearZombies() {
        if (this.zombieContainer) {
            this.zombieContainer.destroyAllChildren();
        }
    }

    spawnZombies() {
        this.clearZombies();
        this.spawnCount = Number(this.editbox.string);
        // Canvas dimensions (adjust to match your Canvas)
        const canvasWidth = 1000;
        const canvasHeight = 600;
        const halfWidth = canvasWidth / 2;
        const halfHeight = canvasHeight / 2;

        for (let i = 0; i < this.spawnCount; i++) {
            const zombie = instantiate(this.zombiePrefab);
            zombie.setPosition(
                Math.random() * canvasWidth - halfWidth,
                Math.random() * canvasHeight - halfHeight,

            );
            zombie.parent = this.zombieContainer;
            let anim = zombie.getComponent(Animation);
            anim.play('atk01');


            const pre = this.isSpawning ? this.FrozenDeathMulti : this.FrozenDeath;
            const aniName = this.isSpawning ? 'birth2' : 'birth3';
            const frozenDeath = instantiate(pre);
            frozenDeath.parent = zombie;
            frozenDeath.setPosition(0, 0, 0);
            anim = frozenDeath.getComponent(Animation);

            anim.play(aniName);
        }
    }

}


