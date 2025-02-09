import React, { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@mui/material";

function SignaturePad({ onChange }) {
    const sigCanvasRef = useRef(null);

    const handleClear = () => {
        sigCanvasRef.current.clear();
        onChange && onChange("");
    };

    const handleEnd = () => {
        const dataURL = sigCanvasRef.current.getTrimmedCanvas().toDataURL("image/png");
        onChange && onChange(dataURL);
    };

    return (
        <div>
            <SignatureCanvas
                ref={sigCanvasRef}
                penColor="black"
                canvasProps={{
                    width: 400,
                    height: 150,
                    style: { border: "1px solid #000" },
                }}
                onEnd={handleEnd}
            />
            <Button onClick={handleClear}>Limpar</Button>
        </div>
    );
}

export default SignaturePad;
