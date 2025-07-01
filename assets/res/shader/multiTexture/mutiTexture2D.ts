import { __private, _decorator, Color, Component, Enum, gfx, IAssembler, Node, RenderData, Sprite, UIRenderer } from 'cc';

const { ccclass, property, executeInEditMode } = _decorator;

const Attribute = gfx.Attribute;

export const vfmtPosUvColorTex = [
    new Attribute('a_position', gfx.Format.RGB32F),
    new Attribute('a_texCoord', gfx.Format.RG32F),
    new Attribute('a_color', gfx.Format.RGBA32F),
    new Attribute('a_texture_idx', gfx.Format.R32F),
];

interface IRenderData {
    x: number;
    y: number;
    z: number;
    u: number;
    v: number;
    color: Color;
}


const QUAD_INDICES = Uint16Array.from([0, 1, 2, 1, 3, 2]);


const simple: IAssembler = {
    createData(sprite: Sprite): RenderData {
        const renderData = (sprite as mutiTexture2D).requestRenderData();
        renderData.dataLength = 4;
        renderData.resize(4, 6);
        renderData.chunk.setIndexBuffer(QUAD_INDICES);
        return renderData;
    },

    updateRenderData(sprite: Sprite): void {
        const frame = sprite.spriteFrame;
        const multiTexSprite = sprite as mutiTexture2D; // 提取类型断言

        this.updateUVs(sprite);
        const renderData = sprite.renderData;
        if (renderData && frame) {
            if (renderData.vertDirty) {
                const renderData: RenderData | null = sprite.renderData;
                if (!renderData) {
                    return;
                }
                const uiTrans = sprite.node._uiProps.uiTransformComp!;
                const dataList: IRenderData[] = renderData.data;
                const cw = uiTrans.width;
                const ch = uiTrans.height;
                const appX = uiTrans.anchorX * cw;
                const appY = uiTrans.anchorY * ch;
                let l = 0;
                let b = 0;
                let r = 0;
                let t = 0;
                if (sprite.trim) {
                    l = -appX;
                    b = -appY;
                    r = cw - appX;
                    t = ch - appY;
                } else {
                    const frame = sprite.spriteFrame!;
                    const originSize = frame.originalSize;
                    const ow = originSize.width;
                    const oh = originSize.height;
                    const scaleX = cw / ow;
                    const scaleY = ch / oh;
                    const trimmedBorder = frame.trimmedBorder;
                    l = trimmedBorder.x * scaleX - appX;
                    b = trimmedBorder.z * scaleY - appY;
                    r = cw + trimmedBorder.y * scaleX - appX;
                    t = ch + trimmedBorder.w * scaleY - appY;
                }

                dataList[0].x = l;
                dataList[0].y = b;

                dataList[1].x = r;
                dataList[1].y = b;

                dataList[2].x = l;
                dataList[2].y = t;

                dataList[3].x = r;
                dataList[3].y = t;

                renderData.vertDirty = true;
            }
            renderData.updateRenderData(sprite, frame);
            if (multiTexSprite.textureIdxDirty) {  // 使用提取的变量
                const renderData = sprite.renderData!;
                if (renderData && renderData.chunk) {
                    const vData = renderData.chunk.vb;
                    vData[9] = multiTexSprite.textureIdx;
                    vData[19] = multiTexSprite.textureIdx;
                    vData[29] = multiTexSprite.textureIdx;
                    vData[39] = multiTexSprite.textureIdx;
                    renderData.dataHash = 999;
                    multiTexSprite.textureIdxDirty = false;
                }
            }
        }
    },

    fillBuffers(sprite: Sprite, renderer: any): void {
        if (sprite === null) {
            return;
        }

        const renderData = sprite.renderData;
        if (!renderData) return;
        const chunk = renderData.chunk;
        sprite
        if (sprite.node.hasChangedFlags || renderData.vertDirty) {
            // const vb = chunk.vertexAccessor.getVertexBuffer(chunk.bufferId);
            const renderData = sprite.renderData!;
            const vData = chunk.vb;

            const dataList: IRenderData[] = renderData.data;
            const node = sprite.node;
            const m = node.worldMatrix;

            const m00 = m.m00; const m01 = m.m01; const m02 = m.m02; const m03 = m.m03;
            const m04 = m.m04; const m05 = m.m05; const m06 = m.m06; const m07 = m.m07;
            const m12 = m.m12; const m13 = m.m13; const m14 = m.m14; const m15 = m.m15;

            const stride = renderData.floatStride;
            let offset = 0;
            const length = dataList.length;
            for (let i = 0; i < length; ++i) {
                const curData = dataList[i];
                const x = curData.x;
                const y = curData.y;
                let rhw = m03 * x + m07 * y + m15;
                rhw = rhw ? 1 / rhw : 1;

                offset = i * stride;
                vData[offset + 0] = (m00 * x + m04 * y + m12) * rhw;
                vData[offset + 1] = (m01 * x + m05 * y + m13) * rhw;
                vData[offset + 2] = (m02 * x + m06 * y + m14) * rhw;
            }
            renderData.vertDirty = false;
        }

        // quick version
        const vidOrigin = chunk.vertexOffset;
        const meshBuffer = chunk.meshBuffer;
        const ib = chunk.meshBuffer.iData;
        let indexOffset = meshBuffer.indexOffset;

        const vid = vidOrigin;

        // left bottom
        ib[indexOffset++] = vid;
        // right bottom
        ib[indexOffset++] = vid + 1;
        // left top
        ib[indexOffset++] = vid + 2;

        // right bottom
        ib[indexOffset++] = vid + 1;
        // right top
        ib[indexOffset++] = vid + 3;
        // left top
        ib[indexOffset++] = vid + 2;

        // IndexOffset should add 6 when vertices of a rect are visited.
        meshBuffer.indexOffset += 6;
        // slow version
        // renderer.switchBufferAccessor().appendIndices(chunk);
    },

    updateUVs(sprite: Sprite) {
        if (!sprite.spriteFrame) return;
        const renderData = sprite.renderData!;
        const vData = renderData.chunk.vb;
        const uv = sprite.spriteFrame.uv;
        if (!uv) {
            console.error(`uv is missing : ${sprite.node.name}`, sprite)
            return;
        }
        vData[3] = uv[0];
        vData[4] = uv[1];
        vData[13] = uv[2];
        vData[14] = uv[3];
        vData[23] = uv[4];
        vData[24] = uv[5];
        vData[33] = uv[6];
        vData[34] = uv[7];
    },

    updateColor(sprite: Sprite) {
        const renderData = sprite.renderData!;
        const vData = renderData.chunk.vb;
        let colorOffset = 5;
        const color = sprite.color;
        const colorR = color.r / 255;
        const colorG = color.g / 255;
        const colorB = color.b / 255;
        const colorA = color.a / 255;
        for (let i = 0; i < 4; i++, colorOffset += renderData.floatStride) {
            vData[colorOffset] = colorR;
            vData[colorOffset + 1] = colorG;
            vData[colorOffset + 2] = colorB;
            vData[colorOffset + 3] = colorA;
        }
    },
};


enum TEXTURE_IDX {
    TEX_0 = 0,
    TEX_1,
    TEX_2,
    TEX_3,
    TEX_4,
    TEX_5,
    TEX_6,
    TEX_7,
}


@ccclass('mutiTexture2D')
@executeInEditMode
export class mutiTexture2D extends Sprite {

    @property({ type: Enum(TEXTURE_IDX) })
    private _textureIdx: TEXTURE_IDX = TEXTURE_IDX.TEX_0;
    @property({ type: Enum(TEXTURE_IDX), tooltip: '纹理索引从0开始' })
    set textureIdx(idx: TEXTURE_IDX) {
        this._textureIdx = idx;
        this.textureIdxDirty = true;
        simple.updateRenderData(this as UIRenderer);
    }
    get textureIdx(): TEXTURE_IDX {
        return this._textureIdx;
    }
    textureIdxDirty: boolean = true;

    handle: number = -1;

    public requestRenderData(): RenderData {
        const data = RenderData.add(vfmtPosUvColorTex);
        data.initRenderDrawInfo(this as Sprite, 0);
        this._renderData = data;
        return data;
    }


    onEnable(): void {
        super.onEnable();
        this.textureIdxDirty = true;
        simple.updateRenderData(this as UIRenderer);
    }

    protected _flushAssembler(): void {
        const self = this;
        const assembler = simple;

        if (self._assembler !== assembler) {
            self.destroyRenderData();
            self._assembler = assembler;
        }
        if (!self._renderData) {
            if (assembler && assembler.createData) {
                const rd = self._renderData = assembler.createData(self) as RenderData;
                rd.material = self.getRenderMaterial(0);
                self.markForUpdateRenderData();
                if (self.spriteFrame) {
                    assembler.updateUVs!(self);
                }
                self._updateColor();
            }
        }

    }

}


