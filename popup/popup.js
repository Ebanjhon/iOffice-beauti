/**
 * iOffice Beauti
 * Popup
 */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const hideLoadingToggle =
            document.getElementById("hideLoading");

        /**
         * Đọc trạng thái hiện tại
         */
        chrome.storage.local.get(
            {
                hideLoading: true
            },
            (settings) => {

                hideLoadingToggle.checked =
                    settings.hideLoading;
            }
        );

        /**
         * Người dùng bật / tắt
         */
        hideLoadingToggle.addEventListener(
            "change",
            () => {

                chrome.storage.local.set({
                    hideLoading:
                        hideLoadingToggle.checked
                });

            }
        );

    }
);