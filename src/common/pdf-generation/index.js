const ejs = require("ejs");

const pdf = require("html-pdf");

const fs = require("fs");

const path = require("path");

const requestHelper = require("../../common/request_helper");

class PDFGeneration {
  constructor() {
    this.generatePDF = this.generatePDF.bind(this);

    this._response = {
      status: false,
      message: "Server error! Please try again later",
    };

    this.viewIds = {
      market_research_document: path.join(
        __dirname,
        "views",
        "market_research_document.ejs"
      ),
    };

    this.defaultOptions = {
      format: "A4", // allowed units: A3, A4, A5, Legal, Letter, Tabloid

      orientation: "portrait",

      paginationOffset: 1, // Override the initial pagination number

      header: {
        height: "25mm",

        contents: `<div  style="max-width: 210mm;"  class="h2 text-center font-italic">Headers</div>`,
      },

      footer: {
        height: "20mm",

        contents: {
          default:
            '<div  style="max-width: 210mm;"  class="h6 text-center text-muted">- {{page}} -</div>', // fallback value
        },
      },
    };
  }

  generatePDF = async (viewId, document, options = {}) => {
    try {
      const responseHtml = await ejs.renderFile(
        path.join(this.viewIds[viewId]),
        { document }
      );
      const option = { ...this.defaultOptions, ...options };

      const response = await new Promise((resolve, reject) => {
        pdf

          .create(responseHtml, option)

          .toBuffer(async function (err, buffer) {
            if (err) {
              console.error("Failed to convert PDF to buffer", err);
              reject({ status: false, message: "Can't create Pdf" });
            } else {
              resolve({
                status: true,

                message: "PDF Generated Successfully !!",

                data: buffer.toString("base64"),

                html: responseHtml,
              });
            }
          });
      });

      return requestHelper.respondWithJsonBody(200, response);
    } catch (err) {
      this._response = { message: err.message };

      if (err && err.status_code == 400) {
        return requestHelper.respondWithJsonBody(400, this._response);
      }
      console.log(err);
      return requestHelper.respondWithJsonBody(500, this._response);
    }
  };
}

module.exports = new PDFGeneration();
