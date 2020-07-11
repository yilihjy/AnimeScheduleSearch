export default function checkImg(images,size) {
    if(images) {
      if(images[size]){
        return images[size]
      }
    }
    return ''
  }