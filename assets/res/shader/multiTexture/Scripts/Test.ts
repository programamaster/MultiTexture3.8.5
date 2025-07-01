import { _decorator, Component, EditBox, instantiate, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Test')
export class Test extends Component {
    // Prefab references (assign these in editor)
    @property(Node)
    imagePrefabs: Node[] = [];

    @property(Node)
    nonBatchablePrefabs: Node[] = [];

    @property({ tooltip: "Toggle to spawn/destroy prefabs" })
    private isSpawning: boolean = false;

    @property({ tooltip: "Number of prefabs to spawn" })
    private spawnCount: number = 10000;

    @property(EditBox)
    private editbox: EditBox = null!;

    private Container: Node = null;

    start() {
        this.Container = new Node('Container');
        this.Container.parent = this.node;

    }

    clear() {
        if (this.Container) {
            this.Container.destroyAllChildren();
        }
    }

    clickToggle() {
        this.isSpawning = !this.isSpawning;
    }

    spawnRandomPrefabs() {
        this.clear();
        this.spawnCount = Number(this.editbox.string);
        const canvasWidth = 300;
        const canvasHeight = 600;
        const halfWidth = canvasWidth / 2;
        const halfHeight = canvasHeight / 2;
        const prefabs = this.isSpawning?this.imagePrefabs:this.nonBatchablePrefabs;

        for (let i = 0; i < this.spawnCount; i++) {
            // Randomly select a prefab
            const randomIndex = Math.floor(Math.random() * prefabs.length);
            const prefab = instantiate(prefabs[randomIndex]);

            // Random position within Canvas bounds
            prefab.setPosition(
                Math.random() * canvasWidth - halfWidth,
                Math.random() * canvasHeight - halfHeight,
                0
            );

            prefab.parent = this.Container;
        }
    }


    // ... rest of code ...
}


