class Obstaculo {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.largura = width;
    this.altura = height;
  }

  draw(ctx) {
    ctx.fillStyle = "brown";
    ctx.fillRect(this.x - this.largura/2, this.y - this.altura/2, this.largura, this.altura);
  }
}
