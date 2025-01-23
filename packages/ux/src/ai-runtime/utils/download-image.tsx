export async function downloadImage({ url }: { url: string }) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.src = url;
    image.onload = () => resolve(image);
    image.onerror = (e) => reject(e);
  });
}

export async function convertImageToBlob(image: HTMLImageElement) {
  return new Promise<Blob>((resolve, reject) => {
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d")!;
    c.width = image.naturalWidth;
    c.height = image.naturalHeight;
    ctx.drawImage(image, 0, 0);
    c.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to get image"));
      },
      "image/png",
      1,
    );
  });
}
