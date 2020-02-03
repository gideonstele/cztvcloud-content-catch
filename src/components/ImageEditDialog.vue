<template>
  <el-dialog 
    title="操作图片"
    @close="close"
    :visible.sync="visible"
    top=""
    custom-class="canvas-dialog"
    class="dialog">
    <div class="canvas-content">
      <canvas ref="canvas"></canvas>
    </div>
    <div slot="footer" class="content-toolbar">
        <el-button type="warning" v-if="canClip" @click="clipImgEvent">裁剪图片</el-button>
        <el-button type="primary" @click="downImgEvent">下载图片</el-button>
      </div>
  </el-dialog>
</template>
<script>
import $ from 'jquery';

// todo 选择框样式
// * 选择框边框颜色
const STROKE_COLOR = "red";
// * 选择框边框粗细
const RECT_LINE_WIDTH = 3;
// * 虚线长度
const LINE_DASH_WIDTH = 5;
// * 虚线间隔
const LINE_DASH_SPACE = 5;

// todo 保存图片
// * 保存的文件名
const DOWNLOAD_NAME = "thumbnail";
// * 保存的图片类型
const MIME_TYPE = "png";

class Rect {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

export default {
  inject: ["originImage"],
  data() {
    return {
      mouseX: 0,
      mouseY: 0,
      canClip: true,
      visible: true
    }
  },
  computed: {
    canvas() {
      return this.$refs.canvas
    },
    ctx() {
      return this.$refs.canvas.getContext("2d");
    },
    ratio() {
      // todo 裁剪16:9缩略图，后续扩展
      return 16/9;
    },
    clipRect() {
      if(this.canvas.width / this.ratio <= this.canvas.height){
        // * 高足够，允许上下移动选择
        const width = this.canvas.width;
        const height = this.canvas.width / this.ratio;
        const diffY = this.mouseY / this.zoom() - this.canvas.height / 2;
        const top = (this.canvas.height - height) / 2;

        let y = diffY + top;
        if(y < 0) y = 0;
        if(y + height > this.canvas.height) y = this.canvas.height - height;
        return new Rect(0, y, width, height);
      } else {
        // * 宽足够，允许左右移动选择
        const width = this.canvas.height * this.ratio;
        const height = this.canvas.height;
        const diffX = this.mouseX / this.zoom() - this.canvas.width / 2;
        const left = (this.canvas.width - width) / 2;

        let x = left + diffX;
        if(x < 0) x = 0;
        if(x + width > this.canvas.width) x = this.canvas.width - width;
        return new Rect(x, 0, width, height);
      }
    },
    imgBase64() {
      // * 原始图
      if(this.canClip){
        return this.canvas.toDataURL(`image/${MIME_TYPE}`);
      }

      // * 截取后的图片
      const canvas = document.createElement("canvas");
      canvas.width = this.clipRect.width;
      canvas.height = this.clipRect.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(this.originImage,
        this.clipRect.x, this.clipRect.y, this.clipRect.width, this.clipRect.height,
        0, 0, this.clipRect.width, this.clipRect.height);
      return canvas.toDataURL(`image/${MIME_TYPE}`);
    }
  },
  mounted() {
    this.init();
  },
  destroyed() {
    // todo elementUI 自带销毁属性失效，手动销毁
    $(".el-dialog__wrapper").remove();
  },
  methods: {
    init() {
      this.$nextTick(() => {
        // todo elementUI open, opened 失效，nextTick创建
        this.canvas.width = this.originImage.width;
        this.canvas.height = this.originImage.height;
        this.mouseX = this.canvas.offsetWidth / 2;
        this.mouseY = this.canvas.offsetHeight / 2;
        this.ctx.drawImage(this.originImage, 0, 0);
        this.ctx.strokeStyle = STROKE_COLOR;
        this.ctx.lineWidth = RECT_LINE_WIDTH;
        this.ctx.setLineDash([LINE_DASH_WIDTH, LINE_DASH_SPACE]);
      })
    },
    // todo offset值存在改变，不能使用缓存属性
    zoom() {
      return this.canvas.offsetWidth / this.canvas.width;
    },
    left(el) {
      return el.offsetParent ? el.offsetLeft + this.left(el.offsetParent) : el.offsetLeft;
    },
    top(el) {
      return el.offsetParent ? el.offsetTop + this.top(el.offsetParent) : el.offsetTop;
    },
    clip() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.ctx.drawImage(this.originImage, 0, 0);
      // todo 防止边框线到边缘被遮盖一半
      const x = this.clipRect.x + RECT_LINE_WIDTH;
      const y = this.clipRect.y + RECT_LINE_WIDTH;
      const width = this.clipRect.width - RECT_LINE_WIDTH * 2;
      const height = this.clipRect.height - RECT_LINE_WIDTH * 2;
      this.ctx.strokeRect(x, y, width, height);
    },
    // ! event
    close() {
      // todo 无需动画
      this.$destroy();
    },
    mousedown(e) {
      this.canvas.setPointerCapture(e.pointerId);
      this.mouseX = e.clientX - this.left(e.target);
      this.mouseY = e.clientY - this.top(e.target);
      this.canvas.addEventListener('pointermove', this.mousemove);
      this.canvas.addEventListener('pointerup', this.mouseup);
    },
    mousemove(e) {
      this.mouseX = e.clientX - this.left(e.target);
      this.mouseY = e.clientY - this.top(e.target);
      this.clip();
    },
    mouseup(e) {
      this.canvas.releasePointerCapture(e.pointerId);
      this.canvas.removeEventListener('pointermove', this.mousemove);
      this.canvas.removeEventListener('pointerup', this.mouseup);
    },
    clipImgEvent() {
      this.canClip = false;
      this.clip();
      this.canvas.addEventListener('pointerdown', this.mousedown);
    },
    downImgEvent() {
      const a = document.createElement("a");
      a.download = `${DOWNLOAD_NAME}.${MIME_TYPE}`;
      a.href = this.imgBase64;
      a.click();
    }
  }
};
</script>
<style lang="scss" scoped>
.dialog {
  display: flex;
  align-items: center;
  justify-content: center;
}
::v-deep .canvas-dialog {
  margin: 0;
  min-width: 300px;
  max-width: 600px;
}
.canvas-content {
  canvas {
    max-width: 100%;
    max-height: 100%; 
  }
}
.content-toolbar {
  text-align: right;
}
</style>