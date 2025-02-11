// src/components/ResponsiveSidebar.jsx
import React, { useState } from "react";
import { Drawer, IconButton, useMediaQuery } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useTheme } from "@mui/material/styles";

import Sidebar from "./Sidebar";

/**
 * Exibe a sidebar antiga fixa no canto se for desktop,
 * ou um Drawer com botão hamburger no mobile.
 */
export default function ResponsiveSidebar() {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

    const [drawerOpen, setDrawerOpen] = useState(false);

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    return (
        <>
            {/* Botão hamburger só aparece se não for desktop */}
            {!isDesktop && (
                <IconButton
                    onClick={toggleDrawer}
                    sx={{
                        position: "fixed",
                        top: 16,
                        left: 16,
                        zIndex: 2000,
                        backgroundColor: "#1f2937",
                        color: "#fff",
                        "&:hover": { backgroundColor: "#374151" }
                    }}
                >
                    <MenuIcon />
                </IconButton>
            )}

            {isDesktop ? (
                // MODO DESKTOP: Renderiza sidebar diretamente (fixa à esquerda).
                <Sidebar />
            ) : (
                // MODO MOBILE: Renderiza Drawer do MUI
                <Drawer
                    open={drawerOpen}
                    onClose={toggleDrawer}
                    PaperProps={{
                        sx: {
                            width: 240,
                            backgroundColor: "#1f2937",
                            color: "#fff"
                        }
                    }}
                >
                    {/* Passamos onClose para fechar ao clicar em logout, se quiser */}
                    <Sidebar onClose={toggleDrawer} />
                </Drawer>
            )}
        </>
    );
}
