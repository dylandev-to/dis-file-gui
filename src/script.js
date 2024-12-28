document.addEventListener("DOMContentLoaded", () => {
    const uploadedFile = document.getElementById("selected-p");
    const fileInput = document.getElementById("getFile");
    const progressBar = document.getElementById("progressBar");
    const upButton = document.getElementById("sendButton");

    const clearAllFiles = document.getElementById("clearAll")


    clearAllFiles.addEventListener('click', () => {
        window.electron.OnClearAllFiles();
    })

    const filesDiv = document.getElementById("files-div");

    function loadFiles(files) {
        filesDiv.innerHTML = "";
        files.forEach(file => {
            const fileDiv = document.createElement("div");
            fileDiv.classList.add("file-item");
            fileDiv.innerHTML = `
                 <div class="file-left">
                    <p class="file-name">${file.fileName}</p>
                    <p class="file-id">${file.primaryID}</p>
                 </div>
                 <div class="file-right">
                    <img src="public/download.svg" class="download-btn">
                    <img src="public/delete.svg" class="delete-btn">
                 </div>
             `;

            filesDiv.appendChild(fileDiv);

            const downloadBtn = fileDiv.querySelector(".download-btn");
            const deleteBtn = fileDiv.querySelector(".delete-btn");

            downloadBtn.addEventListener("click", () => {
                window.electron.OnDownloadFile(file.primaryID, file.fileName)
            });

            deleteBtn.addEventListener("click", () => {
                window.electron.OnDeleteFile(file.primaryID)
            });
        })
    }

    const webhookInput = document.getElementById("webhook-file")

    webhookInput.addEventListener('change', (event) => {
        window.electron.OnSetWebhook(event.target.value)
    })

    window.electron.onConfigGet();

    window.electron.OnConfigGetCallback((event, config) => {
        webhookInput.value = config.webhook_url
        loadFiles(config.files)
    })

    var filePathToUpload = null;
    var uploaded = false;

    var intervalProgress;
    var curProgress = 0;
    function completeProgress() {
        clearInterval(intervalProgress)
        curProgress = 100;
        progressBar.value = curProgress
        uploaded = false;
    }
    function falseProgressSoItsNotStaticXD() {
        intervalProgress = setInterval(() => {
            progressBar.value = curProgress
            if (curProgress <= 70) curProgress++;
            else clearInterval(intervalProgress)
        }, 100);
    }

    upButton.addEventListener("click", () => {
        if (!uploaded && filePathToUpload) {
            uploaded = true;
            window.electron.sendFileUpload(filePathToUpload)
            falseProgressSoItsNotStaticXD()
        }
    });

    fileInput.addEventListener('click', (event) => {
        curProgress = 0;
        progressBar.value = curProgress
        window.electron.openFileDialog();
    });

    window.electron.onFileSelected((event, path) => {
        if (path) {
            filePathToUpload = path;
            uploadedFile.textContent = path;
        }
    });

    window.electron.onFileDetails((event, fileDetails) => {
        console.log(fileDetails)
        completeProgress();
        window.electron.onConfigGet();
    })
});