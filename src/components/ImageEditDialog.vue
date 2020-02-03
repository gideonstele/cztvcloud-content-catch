<template>
  <el-dialog 
    title="操作图片"
    @close="close"
    :visible.sync="visible">
    <div class="canvas-content">
      <canvas ref="canvas"></canvas>
    </div>
    <div slot="footer" class="content-toolbar">
        <el-button type="warning" v-if="canClip" @click="clipImg">裁剪图片</el-button>
        <el-button type="primary" @click="downImg">下载图片</el-button>
      </div>
  </el-dialog>
</template>
<script>
import $ from 'jquery';

class Rect {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

const FILL_COLOR = "rgba(105,105,105, 0.5)";
const IMAGE_TYPE = "image/png";
const DOWNLOAD_NAME = "thumbnail.png";

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
    zoom() {
      return this.$refs.canvas.offsetWidth / this.$refs.canvas.width;
    },
    ratio() {
      // todo 裁剪16:9缩略图，后续扩展
      return 16/9;
    },
    clipRect() {
      if(this.canvas.width / this.ratio <= this.canvas.height){
        // * 高足够
        const width = this.canvas.width;
        const height = this.canvas.width / this.ratio;
        const x = 0;
        const diffY = this.mouseY / this.zoom - this.canvas.height / 2;
        const top = (this.canvas.height - height) / 2;

        let y = diffY + top;
        if(y < 0) y = 0;
        if(y + height > this.canvas.height) y = this.canvas.height - height;
        return new Rect(x, y, width, height);
      } else {
        // * 宽足够
        const width = this.canvas.height * this.ratio;
        const height = this.canvas.height;
        const diffX = this.mouseX / this.zoom - this.canvas.width / 2;
        const left = (this.canvas.width - width) / 2;
        const y = 0;

        let x = left + diffX;
        if(x < 0) x = 0;
        if(x + width > this.canvas.width) x = this.canvas.width - width;
        return new Rect(x, y, width, height);
      }
    },
    imgBase64() {
      if(this.canClip){
        return this.canvas.toDataURL(IMAGE_TYPE);
      }

      const canvas = document.createElement("canvas");
      canvas.width = this.clipRect.width;
      canvas.height = this.clipRect.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(this.originImage,
        this.clipRect.x, this.clipRect.y, this.clipRect.width, this.clipRect.height,
        0, 0, this.clipRect.width, this.clipRect.height);
      return canvas.toDataURL(IMAGE_TYPE);
    }
  },
  mounted() {
    this.$nextTick(() => {
      // todo elementUI open, opened 失效，nextTick创建，后续看情况优化
      this.init();
    })
  },
  methods: {
    init() {
      this.canvas.width = this.originImage.width;
      this.canvas.height = this.originImage.height;
      this.mouseX = this.canvas.offsetWidth / 2;
      this.mouseY = this.canvas.offsetHeight / 2;
      this.ctx.drawImage(this.originImage, 0, 0);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      this.ctx.fillStyle = FILL_COLOR;
    },
    left(el) {
      return el.offsetParent ? el.offsetLeft + this.left(el.offsetParent) : el.offsetLeft;
    },
    top(el) {
      return el.offsetParent ? el.offsetTop + this.top(el.offsetParent) : el.offsetTop;
    },
    close() {
      // todo elementUI 销毁属性失效，手动销毁，后续优化
      $(".el-dialog__wrapper").remove();
      this.$destroy();
    },
    clip() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.ctx.drawImage(this.originImage, 0, 0);
      this.ctx.fillRect(this.clipRect.x, this.clipRect.y, this.clipRect.width, this.clipRect.height);
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
    clipImg() {
      this.canClip = false;
      this.clip();
      this.canvas.addEventListener('pointerdown', this.mousedown);
    },
    downImg() {
      const a = document.createElement("a");
      a.download = DOWNLOAD_NAME;
      a.href = this.imgBase64;
      a.click();
    }
  }
};
</script>
<style lang="scss" scoped>
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