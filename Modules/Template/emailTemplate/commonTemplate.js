const roundImage = require("./roundImage")
exports.titleAndValueWithText = (key = "", value = "") => {
    return (
        `<div style="padding-left: 15px;">
            <span style="color: #818181;
                        font-family: Sofia Pro;
                        font-size: 16px;
                        font-style: normal;
                        font-weight: 400;
                        line-height: 26px;
                        margin-right: 10px;">
                 ${key}
            </span>
            <span style="color: #000;
                    font-family: Sofia Pro;
                    font-size: 16px;
                    font-style: normal;
                    font-weight: 400;
                    line-height: 26px;">
                ${value}
            </span>
    </div>
        `
    )

}
exports.profileDetailsAndNameTime = ({ profile = "", name = "", time = "" }) => {
    return (
        ` <div style="margin:0 auto;display:flex">
            ${roundImage.roundImage(profile)}
            ${nameAndDateGet(name, time)}
     </div>`
    )
}

function nameAndDateGet(name = "", time = "") {
    return (
        `<div style="padding-left: 15px;">
            <span style="color: #535358;
                        font-family: Sofia Pro;
                        font-size: 16px;
                        font-style: normal;
                        font-weight: 400;
                        line-height: 30px;">
                ${name}
            </span>
            <span style="color: #535358;
                        font-family: Sofia Pro;
                        font-size: 14px;
                        font-style: normal;
                        font-weight: 300;
                        line-height: 30px;
                        margin-left: 5px;">
                             ${time}
            </span>
    </div>
        `

    )

}

exports.titleTextToChange = ({ title = "", oldValue = "", newValue = "" }) => {
    return (`<div> 
         ${title} <div><span>${oldValue}</span></div>  ->  <div><span >${newValue}</span></div>
        </div> 
        `)

}

exports.titleTextImageToChange = ({ title = "", oldValue = "", newValue = "", oldImage = "", newImage = "" }) => {
    return (`<div> 
         ${title} <div><img src="${oldImage}" /><span>${oldValue}</span></div>  ->  <div><img src="${newImage}" /><span >${newValue}</span></div>
        </div> 
        `)

}



exports.imageViewTD = (image = "") => {
    if (image == "") {
        image = 'https://firebasestorage.googleapis.com/v0/b/alian-hub-beta.appspot.com/o/default_images%2Fdefault_user.png?alt=media&token=26ed33f8-562e-4bba-a1d3-28f56cfe51a6'
    }
    return (`
    <p class="sub-p" style="text-size-adjust:100%;-ms-text-size-adjust:100%;-moz-text-size-adjust:100%;-webkit-text-size-adjust:9%;font-size:16px;line-height:1.4em;color: #4d4d4d; margin: 0 !important;">
    <img src="${image}" alt="Alian ERP; Alian hub" width="40" border="0" style="border:0;height:auto;line-height:100%;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;display: block; max-width: 100%; mso-hide: all;">
  </p>
  `)
}

exports.userNameViewTD = (name = "") => {
    return (`
    <p class="sub-p" style="text-size-adjust:100%;-ms-text-size-adjust:100%;-moz-text-size-adjust:100%;-webkit-text-size-adjust:31%;font-size:16px;font-weight: 400;color: #4d4d4d; margin: 0 !important;">
    <font color="#535358">${name}</font>
  </p>
    `)
}

exports.dateViewTD = (date = "") => {
    return (
        `<p class="sub-p" style="text-size-adjust:100%;-ms-text-size-adjust:100%;-moz-text-size-adjust:100%;-webkit-text-size-adjust:60%;font-size:14px;color: #4d4d4d;font-weight: 300; margin: 0 !important;">
         <font color="#535358">${date}</font>
        </p>
        `
    )
}

exports.LabelAndValueTextOnly = (label = "", value = "") => {

    return (
        `
    <table width="100%" align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;table-layout: fixed;">
        <tbody>
            <tr style="display:flex;align-items: center;">
                <td style="mso-table-lspace:0pt;mso-table-rspace:0pt; padding-left: 0; padding-right: 20px; width: 20%; min-width:0px;" align="left" valign="top">
                <font color="#818181">${label}</font>
                </td>
                <td style="mso-table-lspace:0pt;mso-table-rspace:0pt;padding-left: 0; padding-right: 0px; vertical-align: middle;width:80%;" align="left" valign="middle">
                    <div style="display:flex;align-items:center;">
                    <p style="display:inline-block;margin: 0;padding: 0px 7px;color: #000;font-size: 16px;line-height: 26px;border-radius: 4px;">${value}</p> 
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
    `
    )
}



exports.messageTextOnly = (value = "") => {

    return (
        ` <table width="100%" align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;table-layout: fixed;">
        <tbody>
          <tr style="display:flex;align-items: center;">
            <td style="mso-table-lspace:0pt;mso-table-rspace:0pt; padding-left: 0; padding-right: 20px; width: 100%; min-width:0px;" align="left" valign="top">
              <p>${value}</p>
              </td>
          </tr>
      </tbody>
    </table>
        `
    )
}


exports.updateView = ({ value = "Status", oldValue = { backColor: "", color: "", name: "", image: "" }, newValue = { backColor: "", color: "", name: "", image: "" }, type = "image", }) => {
   
    return (
        `<table width="100%" align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;table-layout: fixed;">
        <tbody>
          <tr style="display:flex;align-items: center;">
            <td style="mso-table-lspace:0pt;mso-table-rspace:0pt; padding-left: 0; padding-right: 20px; width: 12%; min-width:60px;" align="left" valign="top">
              <font color="#818181">${value}</font>
            </td>
            <td style="mso-table-lspace:0pt;mso-table-rspace:0pt;padding-left: 0; padding-right: 0px; vertical-align: middle;width:88%;" align="left" valign="middle">
                <div style="display:flex;align-items: center;">
                 ${oldValue?.name==""?"":manageRender(type, oldValue)}
                    ${oldValue?.name==""?"":`<p style="display:inline-block;margin: 0px 10px;line-height: 37px;height: 29px;"> 
                        <img src="https://firebasestorage.googleapis.com/v0/b/alian-hub-beta.appspot.com/o/default_images%2Farrow_right_alt.png?alt=media&amp;token=0d70f0ed-51d5-437f-81f1-ba2392837561" alt="Alian ERP; Alian hub">
                    </p>`}
                    ${manageRender(type, newValue)}
                </div>
            </td>
        </tr>
      </tbody>
    </table>`
    )
}


function Button(data) {
    return (
        `<p style="display:inline-block;margin: 0;padding: 5px 7px;background-color:${data.backColor};color: ${data.color};font-size: 13px;line-height: 19px;border-radius: 4px;">${data.name}</p> 
        `
    )
}

function ImageWithText(data) {
    return (
        ` <p style="display:inline-block;margin: 0;padding: 5px 7px;color: #000;font-size: 16px;line-height: 23px;"><img style="width:11px;height:auto;object-fit:contain;margin:0 10px" src="${data.image}"/>${data.name}</p>`
    )
}

function TextOnly(data) {
    return (
        `<p style="display:inline-block;margin: 0;padding: 5px 7px;color: #000;font-size: 16px;line-height: 23px;">${data.name == "" ? "N/A" : data.name}</p>`
    )
}

function RoundImageWithText(data) {
    return (
        ` <p style="display:inline-block;margin: 0;padding: 5px 7px;color: #000;font-size: 16px;line-height: 23px;">${exports.imageViewTD(data.image)}<span style="margin-left:10px;"/>${data.name}</p>`
    )
}
function manageRender(type, value, isRight) {
    switch (type) {
        case "button":
            return Button(value)
        case "imageText":
            return ImageWithText(value)
        case "roundImageText":
            return RoundImageWithText(value)
        case "text":
            return TextOnly(value)
        default:
            return `<p></p>`
    }
}
