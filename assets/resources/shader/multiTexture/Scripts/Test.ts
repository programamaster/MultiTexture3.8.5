import { _decorator, Component, instantiate, Node } from 'cc';
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

    start() {
        if (this.isSpawning) {
            this.spawnRandomPrefabs();
        }
        else {
            this.spawnNonBatchablePrefabs();
        }

    }

    spawnRandomPrefabs() {
        const node = new Node('PrefabContainer');
        node.parent = this.node;

        // Canvas dimensions (adjust these to match your actual Canvas size)
        const canvasWidth = 1000;
        const canvasHeight = 600;
        const halfWidth = canvasWidth / 2;
        const halfHeight = canvasHeight / 2;

        for (let i = 0; i < this.spawnCount; i++) {
            // Randomly select a prefab
            const randomIndex = Math.floor(Math.random() * this.imagePrefabs.length);
            const prefab = instantiate(this.imagePrefabs[randomIndex]);

            // Random position within Canvas bounds
            prefab.setPosition(
                Math.random() * canvasWidth - halfWidth,
                Math.random() * canvasHeight - halfHeight,
                0
            );

            prefab.parent = node;
        }
    }

    spawnNonBatchablePrefabs() {
        const node = new Node('NonBatchableContainer');
        node.parent = this.node;

        const canvasWidth = 1000;
        const canvasHeight = 600;
        const halfWidth = canvasWidth / 2;
        const halfHeight = canvasHeight / 2;

        for (let i = 0; i < this.spawnCount; i++) {
            const randomIndex = Math.floor(Math.random() * this.nonBatchablePrefabs.length);
            const prefab = instantiate(this.nonBatchablePrefabs[randomIndex]);

            prefab.setPosition(
                Math.random() * canvasWidth - halfWidth,
                Math.random() * canvasHeight - halfHeight,
                0
            );

            prefab.parent = node;
        }
    }

    // ... rest of code ...
}


