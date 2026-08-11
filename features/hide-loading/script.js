/**
 * iOffice Beauti
 * Feature: Hide Loading
 */

(() => {
    "use strict";

    const FEATURE_KEY = "hideLoading";
    const STYLE_ID = "ioffice-beauti-hide-loading";

    /**
     * Bật chức năng ẩn loading
     */
    function enable() {
        // Tránh inject CSS nhiều lần
        if (document.getElementById(STYLE_ID)) {
            return;
        }

        const style = document.createElement("style");

        style.id = STYLE_ID;

        style.textContent = `
            .pace-activity {
                display: none !important;
            }
        `;

        document.head.appendChild(style);

        console.log("[iOffice Beauti] Hide Loading: ON");
    }

    /**
     * Tắt chức năng
     */
    function disable() {
        const style = document.getElementById(STYLE_ID);

        if (style) {
            style.remove();
        }

        console.log("[iOffice Beauti] Hide Loading: OFF");
    }

    /**
     * Áp dụng trạng thái feature
     */
    function apply(enabled) {
        if (enabled) {
            enable();
        } else {
            disable();
        }
    }

    /**
     * Khởi tạo feature
     */
    function init() {
        console.log("[iOffice Beauti] Init Hide Loading");

        // Đọc trạng thái đã lưu
        chrome.storage.local.get(
            {
                [FEATURE_KEY]: true
            },
            (settings) => {
                apply(settings[FEATURE_KEY]);
            }
        );

        // Theo dõi popup thay đổi setting
        chrome.storage.onChanged.addListener(
            (changes, areaName) => {

                if (areaName !== "local") {
                    return;
                }

                if (!changes[FEATURE_KEY]) {
                    return;
                }

                apply(changes[FEATURE_KEY].newValue);
            }
        );
    }

    /**
     * Đăng ký feature vào registry chung
     */
    window.iOfficeFeatures =
        window.iOfficeFeatures || {};

    window.iOfficeFeatures.hideLoading = {
        init,
        enable,
        disable,
        apply
    };

})();