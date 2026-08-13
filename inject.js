(() => {
    'use strict';

    const PREFIX = '[Excel PDF]';

    const ROW_SELECTOR = 'div.x_file[id^="file_"]';
    const BUTTON_CLASS = 'excel-pdf-extension-btn';
    const BUTTON_PREFIX = 'excel_pdf_extension_';

    let scanTimer = null;


    // =========================================================
    // UTILITIES
    // =========================================================

    function getFileId(row) {
        const match = String(row?.id || '').match(/^file_(\d+)$/);

        return match
            ? match[1]
            : '';
    }


    function getFileName(row, fileId) {

        // 1. filename trên row
        const attrName =
            row.getAttribute('filename');

        if (attrName) {
            return attrName.trim();
        }


        // 2. input hidden của iOffice
        const input =
            document.getElementById(
                `txt_file_name_${fileId}`
            );

        if (input?.value) {
            return input.value.trim();
        }


        // 3. tên hiển thị
        const span =
            document.getElementById(
                `sp_file_name_${fileId}`
            );

        return String(
            span?.textContent || ''
        ).trim();
    }


    function isExcel(fileName) {
        return /\.(xls|xlsx)$/i.test(
            String(fileName || '').trim()
        );
    }


    // =========================================================
    // BUTTON
    // =========================================================

    function createButton(row, fileId) {

        const buttonId =
            BUTTON_PREFIX + fileId;


        // Đã có nút extension
        if (document.getElementById(buttonId)) {
            return;
        }


        const actions =
            row.querySelector(
                ':scope > .dlk-x-actions'
            );

        if (!actions) {
            return;
        }


        const button =
            document.createElement('button');


        button.id =
            buttonId;

        button.type =
            'button';

        button.className =
            `btn btn-warning btn-xs ${BUTTON_CLASS}`;

        button.title =
            'Chuyển Excel sang PDF';

        button.dataset.fileId =
            fileId;

        button.setAttribute(
            'data-toggle',
            'tooltip'
        );


        /*
         * Không dùng class dlk-cvt-btn
         * và không dùng id btn_cvt_pdf_xxx
         *
         * để iOffice không tự can thiệp vào nút extension.
         */
        button.style.cssText = [
            'cursor:pointer',
            'order:190',
            'min-width:110px',
            'box-sizing:border-box',
            'display:inline-flex',
            'visibility:visible',
            'opacity:1',
            'align-items:center',
            'justify-content:center',
            'padding:1px 6px'
        ].join(';');


        button.innerHTML =
            '<i class="fa fa-file-pdf-o"></i>&nbsp; Chuyển PDF';


        /*
         * Excel của iOffice thường có placeholder CVT_PDF.
         *
         * Xóa placeholder để nút extension chiếm đúng vị trí.
         */
        const placeholder =
            actions.querySelector(
                ':scope > .dlk-btn-placeholder[data-action-key="CVT_PDF"]'
            );

        if (placeholder) {
            placeholder.remove();
        }


        /*
         * Ưu tiên đặt trước menu ...
         */
        const more =
            actions.querySelector(
                ':scope > .dlk-file-more'
            );


        if (more) {

            more.insertAdjacentElement(
                'beforebegin',
                button
            );

        } else {

            actions.appendChild(
                button
            );
        }
    }


    // =========================================================
    // PROCESS ROW
    // =========================================================

    function processRow(row) {

        if (
            !row ||
            row.nodeType !== Node.ELEMENT_NODE
        ) {
            return;
        }


        const fileId =
            getFileId(row);

        if (!fileId) {
            return;
        }


        const fileName =
            getFileName(
                row,
                fileId
            );


        if (!isExcel(fileName)) {
            return;
        }


        createButton(
            row,
            fileId
        );
    }


    // =========================================================
    // INITIAL / FALLBACK SCAN
    // =========================================================

    function scanAll() {

        document
            .querySelectorAll(
                ROW_SELECTOR
            )
            .forEach(
                processRow
            );
    }


    function scheduleScan(delay = 80) {

        clearTimeout(
            scanTimer
        );

        scanTimer =
            setTimeout(
                scanAll,
                delay
            );
    }


    // =========================================================
    // CLICK DELEGATION
    //
    // QUAN TRỌNG:
    // listener nằm ở document chứ không nằm trên từng button.
    //
    // Vì vậy iOffice có render lại div_file_list thì chức năng
    // vẫn hoạt động.
    // =========================================================

    document.addEventListener(
        'click',
        event => {

            const button =
                event.target.closest(
                    `.${BUTTON_CLASS}`
                );


            if (!button) {
                return;
            }


            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();


            const fileId =
                String(
                    button.dataset.fileId || ''
                ).trim();


            if (!/^\d+$/.test(fileId)) {

                console.error(
                    PREFIX,
                    'File ID không hợp lệ:',
                    fileId
                );

                return;
            }


            /*
             * Bảo đảm row/file vẫn còn tồn tại.
             *
             * Sau khi iOffice render lại DOM,
             * tránh gọi bằng ID đã cũ.
             */
            const row =
                document.getElementById(
                    `file_${fileId}`
                );


            if (!row) {

                console.warn(
                    PREFIX,
                    'Không còn tìm thấy file:',
                    fileId
                );

                scheduleScan(0);

                return;
            }


            const fileName =
                getFileName(
                    row,
                    fileId
                );


            /*
             * Chỉ cho Excel.
             */
            if (!isExcel(fileName)) {

                console.warn(
                    PREFIX,
                    'File không còn là Excel:',
                    fileName
                );

                return;
            }


            /*
             * Hàm convert gốc của iOffice.
             */
            if (
                typeof window.dlkCvt_convert !==
                'function'
            ) {

                console.error(
                    PREFIX,
                    'Không tìm thấy dlkCvt_convert của iOffice'
                );

                return;
            }


            console.log(
                PREFIX,
                'Convert:',
                fileId,
                fileName
            );


            try {

                window.dlkCvt_convert(
                    fileId
                );

            } catch (error) {

                console.error(
                    PREFIX,
                    'Lỗi convert:',
                    error
                );
            }

        },

        /*
         * Capture phase.
         *
         * Giúp extension bắt click trước một số handler
         * của giao diện iOffice.
         */
        true
    );


    // =========================================================
    // MUTATION OBSERVER
    // =========================================================

    const observer =
        new MutationObserver(
            mutations => {

                let needFullScan =
                    false;


                for (const mutation of mutations) {

                    if (
                        mutation.type !==
                        'childList'
                    ) {
                        continue;
                    }


                    for (
                        const node
                        of mutation.addedNodes
                    ) {

                        if (
                            node.nodeType !==
                            Node.ELEMENT_NODE
                        ) {
                            continue;
                        }


                        /*
                         * Trường hợp iOffice thêm trực tiếp:
                         *
                         * <div id="file_123" class="x_file">
                         */
                        if (
                            node.matches?.(
                                ROW_SELECTOR
                            )
                        ) {

                            processRow(node);

                            continue;
                        }


                        /*
                         * Trường hợp iOffice render cả container,
                         * ví dụ div_file_list mới.
                         */
                        if (
                            node.querySelector?.(
                                ROW_SELECTOR
                            )
                        ) {

                            needFullScan =
                                true;
                        }
                    }
                }


                /*
                 * Chỉ quét toàn danh sách khi thật sự cần.
                 *
                 * Không scan toàn DOM cho mọi mutation như
                 * phiên bản trước.
                 */
                if (needFullScan) {
                    scheduleScan(50);
                }
            }
        );


    // =========================================================
    // INIT
    // =========================================================

    function init() {

        console.log(
            PREFIX,
            'Extension loaded'
        );


        // Các file đã có sẵn
        scanAll();


        /*
         * Theo dõi AJAX/render lại của iOffice.
         */
        observer.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );


        /*
         * Một lượt dự phòng sau khi các script iOffice
         * hoàn tất render.
         */
        setTimeout(
            scanAll,
            500
        );
    }


    if (
        document.readyState ===
        'loading'
    ) {

        document.addEventListener(
            'DOMContentLoaded',
            init,
            {
                once: true
            }
        );

    } else {

        init();
    }

})();