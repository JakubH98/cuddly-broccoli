const
    canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d", { willReadFrequently: true }),
    glass = document.getElementById("glass"),
    resultParagraph = document.getElementById("result"),
    sourceMedia = document.getElementById("sourceMedia"),
    cutoutWidthPercentage = 0.6,
    cutoutHeightPercentage = 0.35

let
    cutoutWidth = 0,
    cutoutHeight = 0,
    yStart = 0,
    xStart = 0

document.getElementById("btnActivate").addEventListener("click", async function () {
    await activateCamera()
    setUpCutout()
    decode()
})

document.getElementById("btnPrint").addEventListener("click", function () {
    console.log(sourceMedia.videoWidth, sourceMedia.videoHeight)
})


async function activateCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                optional:  [
                    {minWidth: 320},
                    {minWidth: 640},
                    {minWidth: 1024},
                    {minWidth: 1280},
                    {minWidth: 1920},
                    {minWidth: 2560},
                    {minWidth: 3840}
                ], 
                mandatory: {
                    facingMode: "environment"
                }
            },
            audio: false,
        })

        sourceMedia.srcObject = stream;
        await sourceMedia.play();

    } catch (err) {
        console.error('Could not start camera:', err);
    }
}

function setUpCutout() {
    cutoutWidth = sourceMedia.videoWidth * cutoutWidthPercentage
    cutoutHeight = sourceMedia.videoHeight * cutoutHeightPercentage
    xStart = (sourceMedia.videoWidth - cutoutWidth) / 2
    yStart = (sourceMedia.videoHeight - cutoutHeight) / 2

    canvas.width = cutoutWidth
    canvas.height = cutoutHeight
}

function decode() {
    ctx.drawImage(
        sourceMedia,                // Source (Image | Video).
        xStart, yStart,             // x- and y-coordinate for the starting position of the cutout rect on the source.
        cutoutWidth, cutoutHeight,  // Width and height of the cutout rect.
        0, 0,                       // x- and y-coordinate for the starting position of the cutout rect on the destination canvas.
        cutoutWidth, cutoutHeight   // Width and height of the cutout rect (for scaling)
    )

    const imageData = ctx.getImageData(0, 0, cutoutWidth, cutoutHeight)
    zbarWasm.scanImageData(imageData).then (result => {
        if (result.length) {
            tempString = ""
            result[0].data.forEach(element => {
                tempString += String.fromCharCode(element);
            });
            resultParagraph.innerText = tempString;
            console.log(result);
        } else {
            resultParagraph.innerText = "No code detected"
            console.log("No code detected")
        }
    })
    setTimeout(() => {decode()}, 1000);

}
