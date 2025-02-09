import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Box, Typography } from "@mui/material";

function PhotoUpload({ onFilesChange }) {
    const [files, setFiles] = useState([]);

    const onDrop = useCallback((acceptedFiles) => {
        setFiles((prev) => [...prev, ...acceptedFiles]);
        onFilesChange && onFilesChange(acceptedFiles); // Passa para o pai
    }, [onFilesChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <Box
            {...getRootProps()}
            sx={{
                p: 2,
                textAlign: "center",
                border: "2px dashed #ccc",
                borderRadius: 2,
                cursor: "pointer",
            }}
        >
            <input {...getInputProps()} />
            {isDragActive ? (
                <Typography variant="body1" color="primary">
                    Solte os arquivos aqui ...
                </Typography>
            ) : (
                <Typography variant="body1">
                    Arraste e solte imagens aqui, ou clique para selecionar
                </Typography>
            )}

            {/* Preview das imagens */}
            <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
                {files.map((file, idx) => {
                    const previewUrl = URL.createObjectURL(file);
                    return (
                        <Box
                            key={idx}
                            component="img"
                            src={previewUrl}
                            alt="preview"
                            sx={{ width: 100, height: 100, objectFit: "cover", border: "1px solid #ccc" }}
                        />
                    );
                })}
            </Box>
        </Box>
    );
}

export default PhotoUpload;
