const pdfjs = require("pdfjs-dist/build/pdf.js");

export function convertPDFToTxtWithMetadata(file: any): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const CMAP_URL = "pdfjs-dist/cmaps/";
      const CMAP_PACKED = true;
      // Where the standard fonts are located.
      const STANDARD_FONT_DATA_URL = "pdfjs-dist/standard_fonts/";

      const loadingTask = pdfjs.getDocument({
        data: file,
        cMapUrl: CMAP_URL,
        cMapPacked: CMAP_PACKED,
        standardFontDataUrl: STANDARD_FONT_DATA_URL,
      });

      loadingTask.promise.then(async function (pdf: any) {
        // you can now use *pdf* here
        const maxPages = pdf.numPages;
        var countPromises = []; // collecting all page promises
        for (var j = 1; j <= maxPages; j++) {
          var page = pdf.getPage(j);
          var txt = "";
          countPromises.push(
            page.then(function (page: any) {
              // add page promise

              console.log("page:", page._pageIndex + 1);

              var textContent = page.getTextContent();
              return textContent.then(function (text: any) {
                // return content promise
                return {
                  page: page._pageIndex + 1,
                  text: text.items
                    .map(function (s: any) {
                      return s.str;
                    })
                    .join(""),
                };
              });
            })
          );
        }
        const finalTextPerPage = await Promise.all(countPromises).then(
          function (pages) {
            return pages;
          }
        );
        resolve(finalTextPerPage);
      });
    } catch (e) {
      reject(e);
    }
  });
}
