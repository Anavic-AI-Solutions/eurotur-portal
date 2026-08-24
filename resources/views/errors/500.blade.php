<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>500 — Portal Eurotur</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
        <style>
            * { box-sizing: border-box; }
            body {
                margin: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #fff;
                color: #000;
                font-family: 'Archivo', sans-serif;
            }
            .wrap { text-align: center; padding: 32px; max-width: 560px; }
            .code {
                font-family: 'Anton', sans-serif;
                font-size: clamp(96px, 18vw, 180px);
                line-height: 0.85;
                color: #E30613;
                letter-spacing: -0.005em;
            }
            .title {
                font-family: 'Archivo', sans-serif;
                font-weight: 900;
                font-size: 24px;
                text-transform: uppercase;
                letter-spacing: -0.01em;
                margin-top: 18px;
            }
            .text { color: #444; font-size: 15px; line-height: 1.55; margin-top: 12px; }
            .back {
                display: inline-block;
                margin-top: 26px;
                padding: 12px 22px;
                background: #000;
                color: #fff;
                text-decoration: none;
                font-family: 'Space Mono', monospace;
                font-size: 11px;
                letter-spacing: 0.12em;
                text-transform: uppercase;
                border: 1px solid #000;
                transition: background .12s, color .12s;
            }
            .back:hover { background: #E30613; border-color: #E30613; }
            .logo { height: 42px; width: auto; margin-bottom: 26px; }
        </style>
    </head>
    <body>
        <div class="wrap">
            <img src="/eurotur-logo.png" alt="Eurotur" class="logo">
            <div class="code">500</div>
            <div class="title">Algo salió mal</div>
            <p class="text">
                Ocurrió un error inesperado. El equipo de IT ya fue notificado;
                si el problema persiste, avisá por la ticketera.
            </p>
            <a class="back" href="/">← Volver al inicio</a>
        </div>
    </body>
</html>