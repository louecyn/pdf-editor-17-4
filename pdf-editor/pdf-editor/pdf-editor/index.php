<?php
declare(strict_types=1);
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Éditeur de PDF</title>
    <link rel="stylesheet" href="css/pdf-editor.css">
</head>
<body>
    <div class="pdf-editor-app">
        <header class="editor-header">
            <h1>Éditeur de PDF</h1>
            <div class="actions">
                <label class="btn">
                    Importer un PDF
                    <input id="local-file" type="file" accept="application/pdf" hidden>
                </label>
                <button id="add-text" class="btn" type="button">Ajouter texte</button>
                <button id="add-signature" class="btn" type="button">Signer</button>
                <button id="save" class="btn success" type="button">Enregistrer</button>
            </div>
        </header>
        <main>
            <div id="pdf-viewer" class="pdf-viewer" data-empty-state="Déposez un PDF ou choisissez un document côté portail"></div>
            <div id="editor-feedback" class="editor-feedback" role="status" aria-live="polite"></div>
        </main>
    </div>

    <script>
        window.PDF_EDITOR_CONFIG = {
            pdfGeneratorUrl: 'php/generate_pdf.php'
        };
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.js" integrity="sha512-dOGN5eGHIoQapMI2vlA38nSxrdbidKdvUSsfx8bVsgcuyoIwukSxnl2xe50Tzw9uQWGWpZJYG1ChcxrFAuo0xQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script type="module">
        import PdfEditor from './js/pdf-editor.js';

        const viewer = document.getElementById('pdf-viewer');
        const feedback = document.getElementById('editor-feedback');
        const editor = new PdfEditor(viewer, {
            pdfGeneratorUrl: window.PDF_EDITOR_CONFIG.pdfGeneratorUrl,
            feedbackEl: feedback,
        });

        document.getElementById('add-text').addEventListener('click', () => {
            editor.setTool('text');
            editor.feedback('Cliquez sur le PDF pour ajouter du texte.');
        });

        document.getElementById('add-signature').addEventListener('click', () => {
            editor.setTool('signature');
            editor.feedback('Cliquez sur le PDF pour placer votre signature.');
        });

        document.getElementById('save').addEventListener('click', async () => {
            if (editor.state?.activeRequest === 'local') {
                editor.feedback('Enregistrez depuis le portail administratif.');
                return;
            }
            try {
                const result = await editor.save();
                const link = document.createElement('a');
                link.href = result.downloadUrl;
                link.download = result.fileName;
                document.body.appendChild(link);
                link.click();
                link.remove();
            } catch (error) {
                console.error(error);
                editor.feedback('Enregistrez depuis le portail pour inclure les métadonnées.');
            }
        });

        const localInput = document.getElementById('local-file');
        localInput.addEventListener('change', () => {
            const file = localInput.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async () => {
                await editor.loadDocumentFromBuffer(reader.result, {
                    name: file.name,
                    requestId: 'local',
                });
                editor.feedback('PDF importé depuis votre poste.');
            };
            reader.readAsArrayBuffer(file);
        });
    </script>
</body>
</html>