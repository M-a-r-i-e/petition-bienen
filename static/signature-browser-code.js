
// code für den browser

const canvas = document.querySelector("#signature-canvas");
const ctx = canvas.getContext("2d");

let currentX = 0;
let currentY = 0;

function drawTo(newX, newY){

    // draw from current to new

    ctx.beginPath();
    ctx.moveTo(currentX, currentY);
    ctx.lineTo(newX,newY);
    ctx.closePath();
    ctx.stroke();

    //upodate the current values

    currentX = newX;
    currentY = newY;

}

$("#signature-canvas").on("mousedown", function() {    
    console.log("maus auf canvas");

    $("#signature-canvas").on('mousemove', e => {

        const canvasPosition = $("#signature-canvas").position();

        const newMouseX = e.clientX - canvasPosition.left; //
        const newMouseY = e.clientY - canvasPosition.top + $(document).scrollTop();

        drawTo (newMouseX, newMouseY);

    });


});

$("#signature-canvas").on("mouseup", function() {
    $("#signature-canvas").off("mousemove");
});


//variable zum merken ob mouse klick
//listener mouse downn --> variable true
//listener mouse down -->  variable false


// copy code from canvas to hidden field
$("#signature-canvas").on("mouseleave", e => {
    console.log("copy code from canvas to hidden field");

    $("#signature-code").val(canvas.toDataURL());

});
