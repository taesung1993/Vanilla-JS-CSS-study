const removePallete = (tag) => {
    const pallete = tag.querySelector(".palette");
    tag.removeChild(pallete);
}

const changeTextColor = (e, cmd) => {
    const rootTarget = e.currentTarget;
    const selectedColor = e.target.closest(".color");

    if(selectedColor){
        const colorData = selectedColor.dataset.colorData;
        textEditorField.document.execCommand(cmd, false, colorData);
        removePallete(rootTarget.parentNode);
        switch(cmd){
            case 'foreColor':
                isPalleteFromTextColor = false;
                break;
            case 'hiliteColor':
                isPalleteFromTextBgColor = false;
                break;
        }
    }
};

const generatePallete = (tag) => {
    const pallete = document.createElement("div");
    const colors = ["#000000", "#ffffff", "#7f8c8d", "#e74c3c", "#e67e22", "#34495e", "#f1c40f", "#27ae60", "#3498db", "#8e44ad"];
    const iconNode = tag.querySelector(".icon-container");
    const cmd = iconNode.dataset.cmd;
    pallete.classList.add("palette");

    /* 컬러 태그 생성 */
    for(let i=0; i<colors.length; i++){
        const color = document.createElement("span");
        color.style.backgroundColor = `${colors[i]}`;
        color.dataset.colorData = colors[i];
        color.classList.add("color");
        pallete.appendChild(color);
    }

    pallete.addEventListener("click", (e) => {changeTextColor(e, cmd);});

    tag.appendChild(pallete);
}


const appliedCommandToEditor = (e) => {
    const btn = e.target.closest(".icon-container");

    if(btn){
        const cmd = btn.dataset.cmd;
        switch(cmd){
            case 'createLink':
                linkModal.classList.remove("hidden");
                /* link 모달 취소 버튼 눌렀을 때 또는 닫기 버튼을 눌렀을 때 모달을 숨긴다.*/
                [modalCloseBtn, modalCancleBtn].forEach((closeBtn) => {
                    closeBtn.addEventListener("click", (e) => {
                        e.preventDefault();
                        linkModal.classList.add("hidden");
                    })
                });
                /* URL 입력 후, 확인 버튼을 누르면 URL이 텍스트 에디터에 삽입되어 입력된다. */
                modalComplete.addEventListener("click", (e) => {
                    e.preventDefault();
                    const link = modalInput.value;
                    const cmd = 'createLink';
                    modalInput.value = "";
                    textEditorField.document.execCommand(cmd, false, link);
                    linkModal.classList.add("hidden");

                    /* 텍스트 필드에 a태그를 생성 후 이벤트를 걸어준다. */
                    const atags = textEditorField.document.querySelectorAll("a");
                    atags.forEach((atag) => {
                        atag.target = "_blank";
                        atag.addEventListener("mouseover", (e) => {textEditorField.document.designMode = "Off"; });
                        atag.addEventListener("mouseout", (e) => {textEditorField.document.designMode = "On"; });
                    });
                });

                break;
            case 'uploadImage':
                const dragAndDropModalClose = document.querySelector(".drag-drop-modal__close"); // 닫기 버튼(X)
                const cancelBtnInModal = document.getElementById("cancelBtnInModal"); //취소 버튼
                const closeBtns = [dragAndDropModalClose, cancelBtnInModal];
                let reader = new FileReader();

                const updateThumbnail = (fileList) => {
                    /* 파일 리스트를 받아서 게시판에 사진 추가*/
                    const thumbnailContainer = document.createElement("div");
                    
                    thumbnailContainer.classList.add("uploaded-box");
                    console.log(fileList);
                    reader = new FileReader();

                    for(let i=0; i<fileList.length; i++){
                        const file = fileList.item(i);
                        
                        if(file.type.startsWith("image/")){
                            const thumbnail = document.createElement("div");
                            thumbnail.classList.add("thumbnail");
                            thumbnailContainer.appendChild(thumbnail);
                
                            reader.readAsDataURL(file);
                            reader.onload = () => {
                                const uploadBtn = document.getElementById("imageUploadBtnInModal");
                                const uploadThumbnail = (e) => {
                                    e.preventDefault();
                                    const thumbnailBox = document.querySelector(".uploaded-box");
                                    if(reader){
                                        textEditorField.document.execCommand("insertImage", false, reader.result);
                                        /* reader 값을 null로 설정해줌으로써, 이전에 업로드한 사진까지 올라오는 것을 막는다. */
                                        reader = null;
                                    }
                                    if(thumbnailBox){
                                        /* 썸네일 박스가 등록되어 있다면, 이를 제거한다. */
                                        dragZone.removeChild(thumbnailBox);
                                    }
                                    /* 모달을 닫는다. */
                                    dragAndDropModal.classList.add("hidden");
                                }
                
                                thumbnail.style.backgroundImage = `url(${reader.result})`;
                                thumbnail.style.backgroundSize = "cover";
                                thumbnail.style.backgroundPosition = "center center";
                                
                                /* 업로드 버튼 눌렀을 때 동작 */
                                uploadBtn.addEventListener("click", uploadThumbnail, true);
                            };
                        }
                    }
                
                    dragZone.appendChild(thumbnailContainer);
                }
                const fileIsDragedOver = (e) => {
                    e.preventDefault();
                }
                const fileIsDragedDrop = (e) => {
                    e.preventDefault();
                    /* 이벤트 버블링 막기, 이미지가 중복으로 올라가는 것을 방지*/
                    e.stopImmediatePropagation();
                    /* 받은 이벤트 파일을 인풋 태그에 넣는다. */
                    dropZone.file = e.dataTransfer.files;
                    const fileList = dropZone.file;

                    updateThumbnail(fileList);
                }

                const processCloseBtn = (e) => {
                    e.stopImmediatePropagation();
                    /* 썸네일 박스를 지우고, reader를 초기화 시킨다. */
                    const thumbnailBox = document.querySelector(".uploaded-box");
                    if(thumbnailBox){
                        dragZone.removeChild(thumbnailBox);
                    }
                    reader = null;
                    dragAndDropModal.classList.add("hidden");
                }


                /* 
                   드래그 오버: curentTarget 태그에 드래그 오버 시, 브라우저 새 탭이 열리지 않는다. 
                   드랍: 파일을 해당 태그에 드랍했을 때 동작하는 이벤트 함수
                */

                const clickedDragZone = (e) => {
                    /*stopImmediatePropagation는 같은 이벤트에서 다른 리스너들이 불려지는 것을 막는 것으로, input[type='file']이 두 세번 이상 눌러지는 것을 방지한다. */
                    e.stopImmediatePropagation();
                    dropZone.click();
                }
                const changeDropZone = (e) => {
                    /* 사진이 여러 개 추가되는 것을 막는다. */
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    if(dropZone.files.length){
                        const fileList = dropZone.files;
                        updateThumbnail(fileList);
                    }
                }
                 
                dropZone.addEventListener("change", changeDropZone);
                dragZone.addEventListener("click", clickedDragZone);
                dragZone.addEventListener("dragover", fileIsDragedOver);
                dragZone.addEventListener("drop", fileIsDragedDrop);

                dragAndDropModal.classList.remove("hidden");   

                /* 취소 버튼, x표 버튼 모달 닫기 처리 */
                closeBtns.forEach((closeBtn) => {
                    closeBtn.addEventListener("click", processCloseBtn);
                });
                break;
            case 'foreColor':
                const textColorIcon = e.target.closest("li");

                if(!isPalleteFromTextColor){
                    textColorIcon.style.position = "relative";
                    generatePallete(textColorIcon);
                    isPalleteFromTextColor = true;
                }
                else{
                    removePallete(textColorIcon);
                    isPalleteFromTextColor = false;
                }
                break;
            case 'hiliteColor':
                const hilightColorIcon = e.target.closest("li");

                if(!isPalleteFromTextBgColor){
                    hilightColorIcon.style.position = "relative";
                    generatePallete(hilightColorIcon);
                    isPalleteFromTextBgColor = true;
                }
                else{
                    removePallete(hilightColorIcon);
                    isPalleteFromTextBgColor = false;
                }
                break;
            default:
                textEditorField.document.execCommand(cmd, false, null);
                break;
        }
    }
}


/* 이벤트 위임을 이용하여 버튼 제어*/
btnList.addEventListener("click", appliedCommandToEditor);
jsChangeFontSize.addEventListener("change", (e) => {
    const langSelect = e.currentTarget;
    const selectedValue = langSelect.options[langSelect.selectedIndex].value;
    const command = "fontSize";
    textEditorField.document.execCommand(command, false, selectedValue);
});
