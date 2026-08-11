/**
 * iOffice Beauti
 * Content Script
 */

(() => {
    "use strict";

    // console.log("[iOffice Beauti] Content loaded");

    function initFeatures() {

        // Hide Loading
        if (window.iOfficeFeatures?.hideLoading) {
            window.iOfficeFeatures.hideLoading.init();
        }

        // Sau này thêm feature khác ở đây
        // window.iOfficeFeatures?.betterTable?.init();
        // window.iOfficeFeatures?.autoFill?.init();
    }

    initFeatures();

})();