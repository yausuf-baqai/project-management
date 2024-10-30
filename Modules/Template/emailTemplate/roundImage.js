exports.roundImage = (image = "") => {
    if (image == "") {
        image = 'https://firebasestorage.googleapis.com/v0/b/alian-hub-beta.appspot.com/o/default_images%2Fdefault_user.png?alt=media&token=26ed33f8-562e-4bba-a1d3-28f56cfe51a6'
    }
    return`
    <div style="height: 50px;
width: 50px;
object-fit: cover;">
<img src="${image}"
style="border-radius: 50px;
width: 40px;
height: 40px;">
</div>
    `
}